import { useState } from 'react';
import { diamondPointTypes, Node, Edge, EdgePointType } from './classes';

type AddEdgeProps = {
    nodes: Node[];
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    gridSize: { col: number; row: number };
}

export default function AddEdge({ nodes, setEdges, gridSize }: AddEdgeProps) {
    const [formData, setFormData] = useState({
        startNode: 'one',
        startNodePoint: 'right',
        endNode: 'two',
        endNodePoint: 'left',
        colControl: 0,
        rowControl: 0,
    });


    const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'colControl' || name === 'rowControl' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('formData', formData);
        setEdges((prev) => [...prev, new Edge([formData.startNode, formData.startNodePoint as EdgePointType], [formData.endNode, formData.endNodePoint as EdgePointType], nodes, 0, 0, null, null)]);

    };

    return (
        <form className="flex flex-col p-4 bg-yellow-200 min-h-0" onSubmit={handleSubmit}>
            <label className="p-4">
                Start Node:
                <select
                    name="startNode"
                    className="mx-4"
                    value={formData.startNode}
                    onChange={handleChangeSelect}
                >
                    {nodes.map((node, i) => (
                        <option key={i} value={node.name}>
                            {node.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Node Point Start:
                <select
                    name="startNodePoint"
                    className="mx-4"
                    value={formData.startNodePoint}
                    onChange={handleChangeSelect}
                >
                    {diamondPointTypes.map((item, index) => (
                        <option key={index} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                End Node:
                <select
                    name="endNode"
                    className="mx-4"
                    value={formData.endNode}
                    onChange={handleChangeSelect}
                >
                    {nodes.map((node, i) => (
                        <option key={i} value={node.name}>
                            {node.name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Node Point End:
                <select
                    name="endNodePoint"
                    className="mx-4"
                    value={formData.endNodePoint}
                    onChange={handleChangeSelect}
                >
                    {diamondPointTypes.map((item, index) => (
                        <option key={index} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Control Point Column:
                <select
                    name="colControl"
                    className="mx-4"
                    value={formData.colControl}
                    onChange={handleChangeSelect}
                >
                    {Array.from({ length: gridSize.col }, (_, i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Control Point Row:
                <select
                    name="rowControl"
                    className="mx-4"
                    value={formData.colControl}
                    onChange={handleChangeSelect}
                >
                    {Array.from({ length: gridSize.col }, (_, i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit" className="w-16 h-16 p-4 bg-blue-500 text-white rounded">
                Add Edge
            </button>
        </form>
    );
}