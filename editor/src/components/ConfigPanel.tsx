import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useGraphStore } from '@/store/graphStore'
import type { AgentNodeData, InputNodeData, OutputNodeData, AnyNodeData } from '@/types'
import { resolveColor } from '@/types'

const MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-haiku-4-5',
]

const COLORS = ['default', 'blue', 'purple', 'green', 'red', 'orange', 'yellow', 'pink', 'indigo', 'teal', 'cyan']

export default function ConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNode, updateNodeData, deleteSelectedNode } = useGraphStore()
  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  const [form, setForm] = useState<Partial<AnyNodeData>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (selectedNode) {
      setForm({ ...selectedNode.data })
      setDirty(false)
    }
  }, [selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedNode) {
    return (
      <aside className="w-72 flex-shrink-0 bg-panel border-l border-border flex items-center justify-center">
        <p className="text-xs text-zinc-600 text-center px-4">
          Select a node to configure it
        </p>
      </aside>
    )
  }

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const save = () => {
    updateNodeData(selectedNode.id, form as Partial<AnyNodeData>)
    setDirty(false)
  }

  const kind = selectedNode.data.kind

  return (
    <aside className="w-72 flex-shrink-0 bg-panel border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-zinc-200 truncate flex-1">
          {(form as AnyNodeData).label || 'Node Config'}
        </span>
        <button
          onClick={deleteSelectedNode}
          className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded"
          title="Delete node"
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors rounded"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <Field label="Label">
          <input
            value={(form as AnyNodeData).label ?? ''}
            onChange={(e) => update('label', e.target.value)}
            className="input-field"
          />
        </Field>

        {/* ── Agent-specific fields ─────────────────────────────────────── */}
        {kind === 'agent' && (
          <>
            <Field label="Model">
              <select
                value={(form as AgentNodeData).model ?? 'claude-opus-4-6'}
                onChange={(e) => update('model', e.target.value)}
                className="input-field"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Color">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update('color', c)}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: resolveColor(c),
                      borderColor: (form as AgentNodeData).color === c ? '#fff' : 'transparent',
                    }}
                    title={c}
                  />
                ))}
              </div>
            </Field>

            <Field label="Task">
              <textarea
                value={(form as AgentNodeData).task ?? ''}
                onChange={(e) => update('task', e.target.value)}
                rows={4}
                placeholder="Describe what this agent should do…"
                className="input-field resize-none font-mono text-xs"
              />
            </Field>

            <Field label="System Prompt">
              <textarea
                value={(form as AgentNodeData).systemPrompt ?? ''}
                onChange={(e) => update('systemPrompt', e.target.value)}
                rows={10}
                placeholder="Agent system prompt…"
                className="input-field resize-none font-mono text-xs"
              />
            </Field>
          </>
        )}

        {/* ── Input-specific fields ─────────────────────────────────────── */}
        {kind === 'input' && (
          <Field label="Input Content">
            <textarea
              value={(form as InputNodeData).content ?? ''}
              onChange={(e) => update('content', e.target.value)}
              rows={8}
              placeholder="Enter the initial input for this network…"
              className="input-field resize-none"
            />
          </Field>
        )}

        {/* ── Output display ────────────────────────────────────────────── */}
        {kind === 'output' && (
          <Field label="Output">
            <div className="bg-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono leading-relaxed min-h-[120px] whitespace-pre-wrap">
              {(selectedNode.data as OutputNodeData).output ?? (
                <span className="italic text-zinc-600">No output yet — run the graph first.</span>
              )}
            </div>
          </Field>
        )}
      </div>

      {/* Save button (agent/input only) */}
      {kind !== 'output' && (
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={save}
            disabled={!dirty}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          >
            {dirty ? 'Apply Changes' : 'Saved'}
          </button>
        </div>
      )}
    </aside>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}
