import { useTools } from '@/lib/firebaseWebHelpers';

interface ToolsProps {
    problemId: string;
}

export default function Tools({ problemId }: ToolsProps) {
    const { tools, loading } = useTools(problemId);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {tools.map((tool) => (
                <div key={tool.id}>{tool.name}</div>
            ))}
        </div>
    )

}