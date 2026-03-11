import { useRef } from 'react'
import {
  Play, Square, Download, Upload,
  FileJson, FileText, Trash2, ChevronDown, TerminalSquare,
} from 'lucide-react'
import { useGraphStore } from '@/store/graphStore'
import { exportToJSON, exportToYAML, downloadFile, importFromJSON } from '@/lib/exporter'

export default function Toolbar() {
  const {
    nodes, edges, isRunning,
    executeGraph, stopExecution,
    addNode, logPanelOpen, toggleLogPanel,
  } = useGraphStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    downloadFile(exportToJSON(nodes, edges), 'agent-network.json', 'application/json')
  }

  const handleExportYAML = () => {
    downloadFile(exportToYAML(nodes, edges), 'agent-network.yaml', 'text/yaml')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = importFromJSON(String(ev.target?.result ?? ''))
      if (result) {
        useGraphStore.setState({ nodes: result.nodes, edges: result.edges })
      } else {
        alert('Invalid graph file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClear = () => {
    if (nodes.length > 0 && !confirm('Clear the canvas?')) return
    useGraphStore.setState({ nodes: [], edges: [], selectedNodeId: null, logs: [] })
  }

  const handleAddCustomAgent = () => {
    addNode('agentNode', { x: 200, y: 200 }, {
      kind: 'agent',
      label: 'Custom Agent',
      systemPrompt: 'You are a helpful AI assistant.',
      task: 'Complete the given task.',
      model: 'claude-opus-4-6',
      color: 'default',
      status: 'idle',
    })
  }

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-panel border-b border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">A</span>
        </div>
        <span className="text-sm font-semibold text-zinc-200 hidden sm:block">Agency Agents</span>
        <span className="text-xs text-zinc-600 hidden md:block">Network Editor</span>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Run / Stop */}
      {!isRunning ? (
        <button
          onClick={executeGraph}
          disabled={nodes.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          <Play size={14} />
          Run
        </button>
      ) : (
        <button
          onClick={stopExecution}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors animate-pulse"
        >
          <Square size={14} />
          Stop
        </button>
      )}

      <div className="w-px h-6 bg-border" />

      {/* Add custom agent */}
      <button
        onClick={handleAddCustomAgent}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
        title="Add blank agent node"
      >
        <ChevronDown size={12} />
        Custom Agent
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Log panel toggle */}
      <button
        onClick={toggleLogPanel}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${logPanelOpen ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'}`}
        title="Toggle execution log"
      >
        <TerminalSquare size={13} />
        Log
      </button>

      <div className="w-px h-6 bg-border" />

      {/* Export */}
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs transition-colors"
        title="Export as JSON"
      >
        <FileJson size={13} />
        JSON
      </button>
      <button
        onClick={handleExportYAML}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs transition-colors"
        title="Export as YAML"
      >
        <FileText size={13} />
        YAML
      </button>

      {/* Import */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs transition-colors"
        title="Import JSON graph"
      >
        <Upload size={13} />
        Import
      </button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {/* Export all */}
      <button
        onClick={() => {
          const content = exportToJSON(nodes, edges)
          navigator.clipboard.writeText(content).then(() => alert('Copied to clipboard!'))
        }}
        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
        title="Copy JSON to clipboard"
      >
        <Download size={13} />
      </button>

      <div className="w-px h-6 bg-border" />

      {/* Clear */}
      <button
        onClick={handleClear}
        className="p-1.5 rounded-lg hover:bg-red-900/50 text-zinc-600 hover:text-red-400 transition-colors"
        title="Clear canvas"
      >
        <Trash2 size={13} />
      </button>
    </header>
  )
}
