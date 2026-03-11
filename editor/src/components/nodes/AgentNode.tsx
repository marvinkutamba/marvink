import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import type { AgentNodeData } from '@/types'
import { resolveColor } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  idle: '#71717a',
  running: '#f59e0b',
  done: '#22c55e',
  error: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  idle: 'idle',
  running: '●',
  done: '✓',
  error: '✗',
}

function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const accent = resolveColor(data.color)
  const statusColor = STATUS_COLORS[data.status]
  const ring = selected ? `0 0 0 2px ${accent}` : 'none'

  return (
    <div
      className="relative w-56 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden transition-shadow"
      style={{ boxShadow: ring }}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: accent }} />

      {/* Content */}
      <div className="px-3 py-2.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div
            className="h-2 w-2 rounded-full flex-shrink-0 transition-colors"
            style={{ background: statusColor }}
            title={data.status}
          />
          <span className="text-sm font-semibold text-zinc-100 truncate">{data.label}</span>
          <span className="ml-auto text-xs text-zinc-500" style={{ color: statusColor }}>
            {STATUS_LABELS[data.status]}
          </span>
        </div>

        {/* Task preview */}
        <p className="text-xs text-zinc-500 leading-snug line-clamp-2">
          {data.task || 'No task set…'}
        </p>

        {/* Model badge */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: `${accent}22`, color: accent }}
          >
            {data.model.replace('claude-', '')}
          </span>
          {data.status === 'running' && (
            <span className="text-[10px] text-amber-400 animate-pulse">running…</span>
          )}
        </div>

        {/* Output preview */}
        {data.output && data.status === 'done' && (
          <p className="mt-2 text-[11px] text-zinc-500 italic line-clamp-2 border-t border-zinc-800 pt-2">
            {data.output.slice(0, 120)}…
          </p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-800 hover:!bg-zinc-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-zinc-600 !border-2 !border-zinc-800 hover:!bg-zinc-400"
      />
    </div>
  )
}

export default memo(AgentNode)
