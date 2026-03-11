import type { Node, Edge } from 'reactflow'

// ─── Agent Library ────────────────────────────────────────────────────────────

export interface AgentDefinition {
  id: string
  name: string
  description: string
  color: string
  category: string
  systemPrompt: string
  filename: string
}

// ─── Node Data ────────────────────────────────────────────────────────────────

export type NodeStatus = 'idle' | 'running' | 'done' | 'error'

export interface AgentNodeData {
  kind: 'agent'
  label: string
  agentId?: string
  systemPrompt: string
  task: string
  model: string
  color: string
  status: NodeStatus
  output?: string
}

export interface InputNodeData {
  kind: 'input'
  label: string
  content: string
}

export interface OutputNodeData {
  kind: 'output'
  label: string
  output?: string
}

export type AnyNodeData = AgentNodeData | InputNodeData | OutputNodeData

// ─── ReactFlow Types ──────────────────────────────────────────────────────────

export type AppNode = Node<AnyNodeData>
export type AppEdge = Edge

// ─── Execution ────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string
  nodeId?: string
  nodeLabel?: string
  type: 'info' | 'stream' | 'success' | 'error' | 'system'
  text: string
  timestamp: Date
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportedGraph {
  version: '1.0'
  nodes: Array<{
    id: string
    type: string
    data: AnyNodeData
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
  }>
}

// ─── Color Map ────────────────────────────────────────────────────────────────

export const COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#22c55e',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  default: '#71717a',
}

export function resolveColor(color: string): string {
  return COLOR_MAP[color] ?? COLOR_MAP.default
}
