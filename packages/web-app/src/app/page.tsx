'use client'
import { useAppSelector } from '@/redux/hooks';
// import { createIndexWrapper } from '@/lib/pineconeHelpers';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import sendPromptAction from '@/lib/sendPromptAction';


export default function Home() {
  const { data: session } = useSession();
  const isApproved = useAppSelector(state => state.config.isApproved);
  const [isIndexCreated, setIsIndexCreated] = useState(false);

  useEffect(() => { // ATTENTION: temporary hack to create index
    if (!isIndexCreated) {
      // createIndexWrapper();
      setIsIndexCreated(true);
      // console.log('Index created', isIndexCreated);
    }
  }, [isIndexCreated]);

  return (
    <div className='bg-[#A22222] flex flex-col items-center justify-center h-full'>
      <h1 className='text-black text-5xl mb-4'>
        <button
          onClick={async () => {
            const response = await sendPromptAction({
              chatId: '123456',
              promptSeed: 'What is the meaning of life?',
              userName: 'Test User'
            });

            console.log('Response:', response.modelResponse);
          }}
          className='text-black font-bold text-3xl bg-yellow-500 hover:bg-yellow-700 py-2 px-4 rounded'
        >
          Generate Yellowpaper
        </button>
      </h1>
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