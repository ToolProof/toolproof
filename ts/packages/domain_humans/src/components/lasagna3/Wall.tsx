import SideBar from './SideBar';
import Frame from './Frame';
import { useState, useMemo } from 'react';
import { Node, Edge } from './classes';


export default function Wall({ isNor }: { isNor: boolean }) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const squareSize = 7;
    const gridSize = useMemo(() => ({
        col: squareSize,
        row: squareSize,
    }), []);

    return (
        <div className='h-screen flex items-stretch'>
            <div className='flex-1 bg-red-200 p-4 flex flex-col min-h-0'>
                <SideBar nodes={nodes} setNodes={setNodes} setEdges={setEdges} gridSize={gridSize} />
            </div>
            <div className='grow-[2] basis-0 bg-blue-200'>
                <Frame nodes={nodes} edges={edges} gridSize={gridSize} />
            </div>
        </div>
    );
}