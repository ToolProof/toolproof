'use client';
import Problem from '@/components/problem/Problem';
import Frame from '@/components/lasagna/Frame';
import { useState } from 'react';

export default function Home() {
  const [pathDescription, setPathDescription] = useState('');

  return (
    <div className='flex h-screen'>
      <div className='w-[1200px] bg-slate-200'>
        <Problem />
      </div>
      <Frame setPathDescription={setPathDescription} />
    </div>
  )
}