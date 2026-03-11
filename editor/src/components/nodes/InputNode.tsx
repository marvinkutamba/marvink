import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import type { InputNodeData } from '@/types'

function InputNode({ data, selected }: NodeProps<InputNodeData>) {
  return (
    <div
      className="w-48 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden transition-shadow"
      style={{ boxShadow: selected ? '0 0 0 2px #22c55e' : 'none' }}
    >
      <div className="h-1 w-full bg-emerald-500" />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Input</span>
          <span className="text-xs text-zinc-500 ml-auto">{data.label}</span>
        </div>
        <p className="text-xs text-zinc-400 line-clamp-3 leading-snug">
          {data.content || <span className="italic text-zinc-600">empty — click to edit</span>}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-600 !border-2 !border-zinc-800 hover:!bg-emerald-400"
      />
    </div>
  )
}

export default memo(InputNode)
