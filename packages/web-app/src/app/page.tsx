'use client'
import { useAppSelector } from '@/redux/hooks';
// import { createIndexWrapper } from '@/lib/pineconeHelpers';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';


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

  const invokeFooEndpoint = async (data) => {
    try {
      const response = await fetch('https://cloud-run-service-384484325421.europe-west2.run.app/foo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: data }), // Wrap the data in a JSON object
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Response from Cloud Run:', result);
      return result;
    } catch (error) {
      console.error('Error invoking Cloud Run service:', error);
      throw error;
    }
  };
  
  

  return (
    <div className='bg-[#A22222] flex flex-col items-center justify-center h-full'>
      <h1 className='text-black text-5xl mb-4'>
        <button
          onClick={async () => {
            invokeFooEndpoint('sfsdssdfssd');
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