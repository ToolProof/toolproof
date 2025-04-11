import AddNode from './AddNode';
import AddEdge from './AddEdge';
import { Node, Edge } from './classes';

type SideBarProps = {
    nodes: Node[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    gridSize: { col: number; row: number };
}

export default function SideBar({ nodes, setNodes, setEdges, gridSize }: SideBarProps) {
    return (
        <div className='flex flex-col bg-slate-500 p-4 flex-1 min-h-0'>
            <AddNode setNodes={setNodes} gridSize={gridSize} />
            <AddEdge nodes={nodes} setEdges={setEdges} gridSize={gridSize} />
        </div>
    )
}