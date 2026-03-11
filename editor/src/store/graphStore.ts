import { create } from 'zustand'
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type XYPosition,
} from 'reactflow'
import type { AppNode, AppEdge, AnyNodeData, LogEntry, AgentNodeData, InputNodeData, OutputNodeData } from '@/types'

let nodeCounter = 0
const uid = () => `node_${++nodeCounter}_${Date.now()}`
const logUid = () => `log_${Date.now()}_${Math.random()}`

interface GraphStore {
  // ─── Graph State ──────────────────────────────────────────────────────────
  nodes: AppNode[]
  edges: AppEdge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  // ─── Selection ────────────────────────────────────────────────────────────
  selectedNodeId: string | null
  setSelectedNode: (id: string | null) => void

  // ─── Node Operations ──────────────────────────────────────────────────────
  addNode: (type: 'agentNode' | 'inputNode' | 'outputNode', position: XYPosition, data?: Partial<AnyNodeData>) => void
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void
  deleteSelectedNode: () => void

  // ─── Execution ────────────────────────────────────────────────────────────
  isRunning: boolean
  logs: LogEntry[]
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  executeGraph: () => void
  stopExecution: () => void
  abortController: AbortController | null

  // ─── Log Panel ────────────────────────────────────────────────────────────
  logPanelOpen: boolean
  toggleLogPanel: () => void
}

const defaultAgentData = (): AgentNodeData => ({
  kind: 'agent',
  label: 'Agent',
  systemPrompt: 'You are a helpful AI assistant.',
  task: 'Complete the given task.',
  model: 'claude-opus-4-6',
  color: 'default',
  status: 'idle',
})

const defaultInputData = (): InputNodeData => ({
  kind: 'input',
  label: 'Input',
  content: '',
})

const defaultOutputData = (): OutputNodeData => ({
  kind: 'output',
  label: 'Output',
  output: undefined,
})

export const useGraphStore = create<GraphStore>((set, get) => ({
  // ─── Graph State ──────────────────────────────────────────────────────────
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as AppNode[] })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) })
  },

  // ─── Selection ────────────────────────────────────────────────────────────
  selectedNodeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id }),

  // ─── Node Operations ──────────────────────────────────────────────────────
  addNode: (type, position, data = {}) => {
    const id = uid()

    let nodeData: AnyNodeData
    if (type === 'agentNode') {
      nodeData = { ...defaultAgentData(), ...data } as AgentNodeData
    } else if (type === 'inputNode') {
      nodeData = { ...defaultInputData(), ...data } as InputNodeData
    } else {
      nodeData = { ...defaultOutputData(), ...data } as OutputNodeData
    }

    const node: AppNode = { id, type, position, data: nodeData }
    set({ nodes: [...get().nodes, node] })
    return id
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as AnyNodeData } : n
      ),
    })
  },

  deleteSelectedNode: () => {
    const { selectedNodeId, nodes, edges } = get()
    if (!selectedNodeId) return
    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
      selectedNodeId: null,
    })
  },

  // ─── Execution ────────────────────────────────────────────────────────────
  isRunning: false,
  logs: [],
  abortController: null,

  addLog: (entry) => {
    const log: LogEntry = { ...entry, id: logUid(), timestamp: new Date() }
    set({ logs: [...get().logs, log] })
  },

  clearLogs: () => set({ logs: [] }),

  executeGraph: () => {
    if (get().isRunning) return
    const controller = new AbortController()
    set({ isRunning: true, abortController: controller, logPanelOpen: true })
    get().clearLogs()
    // Lazy import to avoid circular dependency
    import('@/lib/executor').then(({ executeGraph: runGraph }) => {
      runGraph(get, set, controller.signal)
    })
  },

  stopExecution: () => {
    get().abortController?.abort()
    set({ isRunning: false, abortController: null })
    get().addLog({ type: 'system', text: '⏹ Execution stopped by user.' })
  },

  // ─── Log Panel ────────────────────────────────────────────────────────────
  logPanelOpen: false,
  toggleLogPanel: () => set({ logPanelOpen: !get().logPanelOpen }),
}))
