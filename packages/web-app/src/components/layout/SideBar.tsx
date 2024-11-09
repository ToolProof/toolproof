'use client';
import * as CONSTANTS from 'shared/src/constants';
import ChatRow from '@/components/layout/ChatRow';
import { useChats, addChat } from '@/lib/firestoreHelpersClient';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/configSlice';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const { chats } = useChats(userEmail);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isApproved = useAppSelector(state => state.config.isApproved);
    const [selectedOption, setSelectedOption] = useState<CONSTANTS.Option>(CONSTANTS.endpoint.opinion.option);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);

    const handleAddChat = async () => {
        const result = await addChat({ userId: userEmail, turnState: 0, tags: [selectedOption] });
        if (result && result.chatId) {
            router.push(`/${CONSTANTS.mapOptionToName(selectedOption)}/${result.chatId}`);
        }
    }

    if (!isApproved) return <div />

    return (
        <div className='flex flex-col h-screen py-0 overflow-x-hidden'>
            <div className='flex-1'>
                <div className='flex justify-center py-4'>
                    <select
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value as CONSTANTS.Option)}
                        className='bg-white border border-gray-300 rounded-md px-4 py-2'
                    >
                        <option value='Opinions'>{CONSTANTS.endpoint.concept.option}</option>
                        <option value='Concepts'>{CONSTANTS.endpoint.opinion.option}</option>
                    </select>
                </div>
                <button
                    onClick={handleAddChat}
                    className='bg-blue-500 text-white px-0 py-2 w-full rounded-md hover:bg-blue-600'
                >
                    Add Chat
                </button>
                <div className='flex flex-col py-4 space-y-2'>
                    {chats.map(chat => (
                        chat.tags.includes(selectedOption) && (
                            <ChatRow key={chat.id} chat={chat} selectedOption={selectedOption} />
                        )
                    ))}
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