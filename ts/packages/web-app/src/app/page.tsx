'use client';
import Frame from '@/components/lasagna/Frame';
import { useState } from 'react';

export default function Home() {
  const [pathDescription, setPathDescription] = useState('');

  return (
    <div className='flex h-screen'>
      <div className='w-[1200px] bg-slate-400'>{pathDescription}</div>
      <Frame setPathDescription={setPathDescription}/>
    </div>
  )
}