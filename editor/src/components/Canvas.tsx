import { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useGraphStore } from '@/store/graphStore'
import AgentNode from './nodes/AgentNode'
import InputNode from './nodes/InputNode'
import OutputNode from './nodes/OutputNode'
import type { AgentDefinition } from '@/types'
import { resolveColor } from '@/types'

const nodeTypes = {
  agentNode: AgentNode,
  inputNode: InputNode,
  outputNode: OutputNode,
}

export default function Canvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    setSelectedNode, addNode,
  } = useGraphStore()

  const rfInstance = useRef<ReactFlowInstance | null>(null)

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setSelectedNode(node.id)
  }, [setSelectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!rfInstance.current) return

    const type = e.dataTransfer.getData('application/reactflow/type')
    if (!type) return

    const position = rfInstance.current.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    })

    if (type === 'agentNode') {
      const agentRaw = e.dataTransfer.getData('application/reactflow/agent')
      const agent: AgentDefinition = agentRaw ? JSON.parse(agentRaw) : {}
      addNode('agentNode', position, {
        kind: 'agent',
        label: agent.name || 'Agent',
        agentId: agent.id,
        systemPrompt: agent.systemPrompt || '',
        task: '',
        model: 'claude-opus-4-6',
        color: agent.color || 'default',
        status: 'idle',
      })
    } else if (type === 'inputNode') {
      addNode('inputNode', position, { kind: 'input', label: 'Input', content: '' })
    } else if (type === 'outputNode') {
      addNode('outputNode', position, { kind: 'output', label: 'Output' })
    }
  }, [addNode])

  return (
    <div className="flex-1 bg-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={(inst) => { rfInstance.current = inst }}
        fitView
        deleteKeyCode="Delete"
        className="bg-canvas"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3f3f46', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: '#52525b', strokeWidth: 2 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
        <Controls
          className="!bg-zinc-900 !border-zinc-700 [&_button]:!bg-zinc-900 [&_button]:!border-zinc-700 [&_button]:!text-zinc-400 [&_button:hover]:!bg-zinc-800"
        />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'inputNode') return '#22c55e'
            if (n.type === 'outputNode') return '#3b82f6'
            const data = n.data as { color?: string }
            return resolveColor(data.color ?? 'default')
          }}
          className="!bg-zinc-900 !border-zinc-700"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
