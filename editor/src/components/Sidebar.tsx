import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { agents, agentsByCategory, categoryLabel } from '@/lib/agents'
import type { AgentDefinition } from '@/types'
import { resolveColor } from '@/types'

interface SidebarProps {
  onAddInput: () => void
  onAddOutput: () => void
}

export default function Sidebar({ onAddInput, onAddOutput }: SidebarProps) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    if (!query.trim()) return null
    const q = query.toLowerCase()
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    )
  }, [query])

  const grouped = useMemo(() => agentsByCategory(), [])

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const onDragStart = (e: React.DragEvent, agent: AgentDefinition) => {
    e.dataTransfer.setData('application/reactflow/type', 'agentNode')
    e.dataTransfer.setData('application/reactflow/agent', JSON.stringify(agent))
    e.dataTransfer.effectAllowed = 'move'
  }

  const AgentCard = ({ agent }: { agent: AgentDefinition }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, agent)}
      className="group flex items-start gap-2.5 px-3 py-2 mx-1 rounded-lg cursor-grab hover:bg-zinc-800 active:cursor-grabbing transition-colors"
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
        style={{ background: resolveColor(agent.color) }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{agent.name}</p>
        <p className="text-[11px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">
          {agent.description.slice(0, 60)}{agent.description.length > 60 ? '…' : ''}
        </p>
      </div>
    </div>
  )

  return (
    <aside className="w-64 flex-shrink-0 bg-panel border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Nodes</p>

        {/* Utility nodes */}
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={onAddInput}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70 border border-emerald-900 transition-colors"
          >
            <Plus size={12} />
            Input
          </button>
          <button
            onClick={onAddOutput}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/70 border border-blue-900 transition-colors"
          >
            <Plus size={12} />
            Output
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search agents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto py-1">
        {agents.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-zinc-500">No agents found.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Run <code className="bg-zinc-800 px-1 rounded">npm run parse-agents</code></p>
          </div>
        )}

        {filtered !== null ? (
          // Search results
          <>
            <p className="px-3 py-1 text-[11px] text-zinc-600">{filtered.length} results</p>
            {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
          </>
        ) : (
          // Grouped view
          Object.entries(grouped).map(([cat, agentList]) => (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-400 transition-colors"
              >
                {collapsed[cat] ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                {categoryLabel(cat)}
                <span className="ml-auto text-zinc-700 normal-case font-normal">{agentList.length}</span>
              </button>
              {!collapsed[cat] && agentList.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-border">
        <p className="text-[11px] text-zinc-600">Drag agents onto the canvas</p>
      </div>
    </aside>
  )
}
