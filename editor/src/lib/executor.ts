import type { AppNode, AgentNodeData, InputNodeData, AnyNodeData, LogEntry } from '@/types'

// Minimal interface that the executor needs from the store
interface ExecStore {
  nodes: AppNode[]
  edges: Array<{ id: string; source: string; target: string; [k: string]: unknown }>
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void
}

type Get = () => ExecStore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Set = (partial: Partial<ExecStore> | ((s: ExecStore) => Partial<ExecStore>) | any) => void

// ─── Topological Sort ─────────────────────────────────────────────────────────

function topologicalSort(nodes: AppNode[], edges: Array<{ source: string; target: string }>): AppNode[] {
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const node of nodes) {
    inDegree.set(node.id, 0)
    adjacency.set(node.id, [])
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0)
  const result: AppNode[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const nextId of adjacency.get(node.id) ?? []) {
      const deg = (inDegree.get(nextId) ?? 1) - 1
      inDegree.set(nextId, deg)
      if (deg === 0) {
        const next = nodes.find((n) => n.id === nextId)
        if (next) queue.push(next)
      }
    }
  }

  return result
}

// ─── SSE Streaming ────────────────────────────────────────────────────────────

async function streamExecute(
  systemPrompt: string,
  task: string,
  input: string,
  model: string,
  onDelta: (text: string) => void,
  signal: AbortSignal
): Promise<string> {
  const response = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, task, input, model }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error ?? 'Execution failed')
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const json = line.slice(6).trim()
      if (!json) continue

      try {
        const event = JSON.parse(json) as { type: string; text?: string; message?: string }
        if (event.type === 'delta' && event.text) {
          fullText += event.text
          onDelta(event.text)
        } else if (event.type === 'done') {
          return event.text ?? fullText
        } else if (event.type === 'error') {
          throw new Error(event.message ?? 'Unknown error')
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }

  return fullText
}

// ─── Main Executor ────────────────────────────────────────────────────────────

export async function executeGraph(get: Get, set: Set, signal: AbortSignal): Promise<void> {
  const { nodes, edges, addLog, updateNodeData } = get()

  const log = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => addLog(entry)

  if (nodes.length === 0) {
    log({ type: 'system', text: 'No nodes on the canvas.' })
    set({ isRunning: false })
    return
  }

  const sorted = topologicalSort(nodes, edges)
  const outputs = new Map<string, string>() // nodeId → output text

  log({ type: 'system', text: `▶ Starting execution (${sorted.length} nodes)` })

  try {
    for (const node of sorted) {
      if (signal.aborted) break

      // ── Collect inputs from predecessor nodes ──────────────────────────────
      const predecessorEdges = edges.filter((e) => e.target === node.id)
      const inputParts = predecessorEdges
        .map((e) => outputs.get(e.source))
        .filter(Boolean) as string[]
      const combinedInput = inputParts.join('\n\n---\n\n')

      // ── InputNode: just pass content downstream ────────────────────────────
      if (node.type === 'inputNode') {
        const data = node.data as InputNodeData
        outputs.set(node.id, data.content)
        log({ type: 'info', nodeId: node.id, nodeLabel: data.label, text: `📥 Input: "${data.content.slice(0, 80)}${data.content.length > 80 ? '…' : ''}"` })
        continue
      }

      // ── OutputNode: receive and display final result ───────────────────────
      if (node.type === 'outputNode') {
        const result = combinedInput || '(no input received)'
        outputs.set(node.id, result)
        updateNodeData(node.id, { output: result })
        log({ type: 'success', nodeId: node.id, nodeLabel: node.data.label, text: `📤 Output captured.` })
        continue
      }

      // ── AgentNode: execute via Claude API ─────────────────────────────────
      if (node.type === 'agentNode') {
        const data = node.data as AgentNodeData
        const label = data.label || 'Agent'

        log({ type: 'info', nodeId: node.id, nodeLabel: label, text: `🤖 Running ${label}…` })
        updateNodeData(node.id, { status: 'running', output: undefined })

        const startTime = Date.now()
        let streamBuffer = ''

        try {
          const result = await streamExecute(
            data.systemPrompt,
            data.task,
            combinedInput,
            data.model,
            (delta) => {
              streamBuffer += delta
              // Batch log updates for performance
              addLog({ type: 'stream', nodeId: node.id, nodeLabel: label, text: delta })
            },
            signal
          )

          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          outputs.set(node.id, result)
          updateNodeData(node.id, { status: 'done', output: result })
          log({ type: 'success', nodeId: node.id, nodeLabel: label, text: `✓ ${label} done in ${elapsed}s` })
        } catch (err) {
          if (signal.aborted) break
          const msg = err instanceof Error ? err.message : String(err)
          updateNodeData(node.id, { status: 'error' })
          log({ type: 'error', nodeId: node.id, nodeLabel: label, text: `✗ ${label} error: ${msg}` })
        }
      }
    }
  } finally {
    if (!signal.aborted) {
      log({ type: 'system', text: '✅ Execution complete.' })
    }
    set({ isRunning: false, abortController: null })
  }
}
