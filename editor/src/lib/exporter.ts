import { stringify as yamlStringify } from 'yaml'
import type { AppNode, AppEdge, ExportedGraph } from '@/types'

export function exportToJSON(nodes: AppNode[], edges: AppEdge[]): string {
  const graph: ExportedGraph = {
    version: '1.0',
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'agentNode',
      data: n.data,
      position: n.position,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
  return JSON.stringify(graph, null, 2)
}

export function exportToYAML(nodes: AppNode[], edges: AppEdge[]): string {
  const graph: ExportedGraph = {
    version: '1.0',
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'agentNode',
      data: n.data,
      position: n.position,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
  return yamlStringify(graph)
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON(json: string): { nodes: AppNode[]; edges: AppEdge[] } | null {
  try {
    const graph = JSON.parse(json) as ExportedGraph
    if (graph.version !== '1.0') throw new Error('Unsupported version')
    return {
      nodes: graph.nodes as AppNode[],
      edges: graph.edges as AppEdge[],
    }
  } catch {
    return null
  }
}
