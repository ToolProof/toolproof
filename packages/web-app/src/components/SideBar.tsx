'use client';
import ConceptRow from './ConceptRow';
import { useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/devConfigSlice';
import { useAppSelector } from '@/redux/hooks';
import { useConcepts, addConcept } from '@/lib/firestoreHelpersClient';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const { concepts, loading, error } = useConcepts(userEmail);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isApproved = useAppSelector(state => state.devConfig.isApproved);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);

    const handleAddConcept = async () => {
        const result = await addConcept({ userId: userEmail, turnState: 0 });
        if (result && result.conceptId) {
            router.push(`/${result.conceptId}`);
        }
    }

    if (!isApproved) return <div />

    return (
        <div className='flex flex-col h-screen py-0 overflow-x-hidden'>
            <div className='flex-1'>
                <button
                    onClick={handleAddConcept}
                    className='bg-blue-500 text-white px-0 py-2 w-full rounded-md hover:bg-blue-600'
                >
                    Add Concept
                </button>
                <div className='flex flex-col py-4 space-y-2'>
                    {concepts.map(concept => (
                        <ConceptRow key={concept.id} concept={concept} />
                    ))}
                </div>
            </div>
            {session && (
                <img
                    src={session?.user?.image || ''}
                    onClick={() => signOut()}
                    alt='Profile Picture'
                    className='h-12 w-12 rounded-full cursor-pointer mx-auto mb-2 hover:opacity-50'
                />
            )}
        </div>
    );

}
