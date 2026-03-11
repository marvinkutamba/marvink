import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import type { OutputNodeData } from '@/types'

function OutputNode({ data, selected }: NodeProps<OutputNodeData>) {
  return (
    <div
      className="w-56 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden transition-shadow"
      style={{ boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none' }}
    >
      <div className="h-1 w-full bg-blue-500" />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Output</span>
          <span className="text-xs text-zinc-500 ml-auto">{data.label}</span>
        </div>
        {data.output ? (
          <p className="text-xs text-zinc-300 line-clamp-4 leading-snug font-mono">
            {data.output.slice(0, 200)}{data.output.length > 200 ? '…' : ''}
          </p>
        ) : (
          <p className="text-xs italic text-zinc-600">Waiting for input…</p>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-zinc-800 hover:!bg-blue-400"
      />
    </div>
  )
}

export default memo(OutputNode)
