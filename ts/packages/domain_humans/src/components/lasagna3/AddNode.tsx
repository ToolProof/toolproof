import { useState } from 'react';
import { natureTypes, environmentTypes, Node, Cell } from './classes';

type AddNodeProps = {
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    gridSize: { col: number; row: number };
}

export default function AddNode({ setNodes, gridSize }: AddNodeProps) {
    const [formData, setFormData] = useState({
        col: 0,
        row: 0,
        name: '',
        nature: 'code',
        environment: 'lgp',
    });


    const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'col' || name === 'row' ? parseInt(value) : value,
        }));
    };

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNodes((prev => [...prev, new Node(new Cell(formData.col, formData.row, 0, 0), formData.name, formData.nature, formData.environment)]));
    };

    return (
        <form className="flex flex-col p-4 bg-gray-200" onSubmit={handleSubmit}>
            <label className="p-4">
                Node Name:
                <input
                    name="name"
                    className="mx-4"
                    value={formData.name}
                    onChange={handleChangeInput}
                    placeholder="Node Name"
                />
            </label>
            <label className="p-4">
                Select column:
                <select
                    name="col"
                    className="mx-4"
                    value={formData.col}
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
                Select row:
                <select
                    name="row"
                    className="mx-4"
                    value={formData.row}
                    onChange={handleChangeSelect}
                >
                    {Array.from({ length: gridSize.row }, (_, i) => (
                        <option key={i} value={i}>
                            {i}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Select nature:
                <select
                    name="nature"
                    className="mx-4"
                    value={formData.nature}
                    onChange={handleChangeSelect}
                >
                    {natureTypes.map((item, index) => (
                        <option key={index} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </label>
            <label className="p-4">
                Select environment:
                <select
                    name="environment"
                    className="mx-4"
                    value={formData.environment}
                    onChange={handleChangeSelect}
                >
                    {environmentTypes.map((item, index) => (
                        <option key={index} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit" className="w-40 h-16 p-4 bg-blue-500 text-white rounded min-h-0">
                Add Node
            </button>
        </form>
    );
}