import FooTable from './FooTable';
import Frame from './Frame';

export default function Wall({ isNor }: { isNor: boolean }) {
    return (
        <div className='h-screen flex items-stretch'>
            <div className='flex-1 bg-red-200 flex'>
                <FooTable />
            </div>
            <div className='grow-[2] basis-0 bg-blue-200'>
                <Frame />
            </div>
        </div>
    );
}