'use client'
import { signIn, useSession } from 'next-auth/react';
import { useAppSelector } from '@/redux/hooks';
import { createIndexWrapper } from '@/lib/pineconeHelpers';
import { useEffect, useState } from 'react';


export default function Home() {
  const { data: session } = useSession();
  const isApproved = useAppSelector(state => state.devConfig.isApproved);
  const [isIndexCreated, setIsIndexCreated] = useState(false);


  useEffect(() => { // ATTENTION: temporary hack to create index
    if (!isIndexCreated) {
      // createIndexWrapper();
      setIsIndexCreated(true);
      console.log('Index created', isIndexCreated);
    }
  }, [isIndexCreated]);

  console.log(`isApproved: ${isApproved}, session:`, session);
  return (
    <div className='bg-[#e2e883] flex flex-col items-center justify-center h-full'>
      <h1 className='text-black text-5xl mb-4'>toolproof.com</h1>
      {
        (isApproved && !session) && (
          <button onClick={() => signIn('google')} className='text-black font-bold text-3xl animate-pulse'> 
            Sign In
          </button>
        )
      }
    </div>
  );
}

// ATTENTION: project-number, not project-name, is shown in google sign-in