'use client';
import FileRow from '@/components/layout/file/FileRow';
import { useResources } from '@/lib/firebaseWebHelpers';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/configSlice';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isApproved = useAppSelector(state => state.config.isApproved);
    const [selectedOption, setSelectedOption] = useState<'DLB' | 'Alzheimer'>('DLB');

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);

    if (!isApproved) return <div />

    return (
        true && // ATTENTION
        <div className='flex flex-col h-screen py-0 overflow-x-hidden'>
            <div className='flex-1'>
                <div className='flex justify-center py-4'>
                    <select
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value as 'DLB' | 'Alzheimer')}
                        className='bg-white border border-gray-300 rounded-md px-4 py-2'
                    >
                        <option value={'Alzheimer'}>Alzheimer</option>
                        <option value={'DLB'}>DLB</option>
                    </select>
                </div>
            </div>
            {session && (
                <Image
                    src={session?.user?.image || ''}
                    onClick={() => signOut()}
                    alt='Profile Picture'
                    className='h-12 w-12 rounded-full cursor-pointer mx-auto mb-2 hover:opacity-50'
                    width={48} // Adjust the width as needed
                    height={48} // Adjust the height as needed
                />
            )}
        </div>
    );
}