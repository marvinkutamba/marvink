import { ReactFlowProvider } from 'reactflow'
import { useGraphStore } from '@/store/graphStore'
import Toolbar from '@/components/Toolbar'
import Sidebar from '@/components/Sidebar'
import Canvas from '@/components/Canvas'
import ConfigPanel from '@/components/ConfigPanel'
import LogPanel from '@/components/LogPanel'

export default function App() {
  const { addNode, logPanelOpen } = useGraphStore()

  const addInput = () =>
    addNode('inputNode', { x: 100, y: 200 }, { kind: 'input', label: 'Input', content: '' })

  const addOutput = () =>
    addNode('outputNode', { x: 800, y: 200 }, { kind: 'output', label: 'Output' })

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-canvas">
        <Toolbar />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar onAddInput={addInput} onAddOutput={addOutput} />
          <Canvas />
          <ConfigPanel />
        </div>

        {logPanelOpen && <LogPanel />}
      </div>
    </ReactFlowProvider>
  )
}
