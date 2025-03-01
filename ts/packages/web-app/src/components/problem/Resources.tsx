import { useResources } from '@/lib/firebaseWebHelpers';

interface ResourcesProps {
    problemId: string;
}

export default function Resources({ problemId }: ResourcesProps) {
    const { resources, loading } = useResources(problemId);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {resources.map((resource) => (
                <div key={resource.id}>{resource.name}</div>
            ))}
        </div>
    )

}