import Resources from '@/components/problem/Resources';
import Tools from '@/components/problem/Tools';
import { useProblem } from '@/lib/firebaseWebHelpers';

export default function Problem() {
    const { problem, loading } = useProblem('fLMIEyB19VUI2V6m5N3M');

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!problem) {
        return <div>Problem not found</div>;
    }

    return (
        <div className='flex flex-col items-center bg-red-400'>
            <h1>{problem.name}</h1>
            <Resources problemId={problem.id} />
            {/* <Tools problemId={problem.id} /> */}
        </div>
    )

}