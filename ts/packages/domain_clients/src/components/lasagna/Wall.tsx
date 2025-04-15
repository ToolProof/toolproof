'use Clients';
import Problem from '@/components/problem/Problem';
import ProblemMock from '@/components/problem/ProblemMock';
import Frame from '@/components/lasagna/Frame';
import { useState } from 'react';


export default function Wall() {
  const [counter, setCounter] = useState(0);
  const [pathDescription, setPathDescription] = useState('');

  return (
    <div className='flex h-screen'>
      {/* <div className='w-[1200px] flex flex-col justify-center items-center py-20 bg-transparent'>
        <ProblemMock counter={counter} isNor={isNor} />
      </div> */}
      <Frame counter={counter} setCounter={setCounter} pathDescription={pathDescription} setPathDescription={setPathDescription} />
    </div>
  )
}