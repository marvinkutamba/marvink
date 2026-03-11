import { useEffect, useRef } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useGraphStore } from '@/store/graphStore'
import type { LogEntry } from '@/types'

const TYPE_STYLES: Record<LogEntry['type'], string> = {
  system: 'text-zinc-500',
  info: 'text-zinc-300',
  stream: 'text-zinc-400 font-mono',
  success: 'text-emerald-400',
  error: 'text-red-400',
}

const TYPE_PREFIX: Record<LogEntry['type'], string> = {
  system: '',
  info: '',
  stream: '',
  success: '',
  error: '',
}

export default function LogPanel() {
  const { logs, clearLogs, toggleLogPanel, isRunning } = useGraphStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Merge consecutive stream deltas from the same node for display
  const mergedLogs = logs.reduce<LogEntry[]>((acc, log) => {
    if (
      log.type === 'stream' &&
      acc.length > 0 &&
      acc[acc.length - 1].type === 'stream' &&
      acc[acc.length - 1].nodeId === log.nodeId
    ) {
      const last = acc[acc.length - 1]
      acc[acc.length - 1] = { ...last, text: last.text + log.text }
    } else {
      acc.push(log)
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col border-t border-border bg-panel h-48 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-shrink-0">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          Execution Log
        </span>
        {isRunning && (
          <span className="flex items-center gap-1 text-xs text-amber-400 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Running…
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={clearLogs}
          className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Clear logs"
        >
          <Trash2 size={12} />
        </button>
        <button
          onClick={toggleLogPanel}
          className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
          title="Close log panel"
        >
          <X size={12} />
        </button>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 font-mono text-xs">
        {mergedLogs.length === 0 ? (
          <p className="text-zinc-700 italic">No logs yet — click Run to execute the graph.</p>
        ) : (
          mergedLogs.map((log) => (
            <div key={log.id} className="flex gap-2 leading-relaxed">
              {log.nodeLabel && (
                <span className="text-zinc-600 flex-shrink-0">[{log.nodeLabel}]</span>
              )}
              <span className={`whitespace-pre-wrap break-all ${TYPE_STYLES[log.type]}`}>
                {TYPE_PREFIX[log.type]}{log.text}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
