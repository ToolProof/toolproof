'use client';
import ChatRow from './ChatRow';
import { useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/devConfigSlice';
import { useAppSelector } from '@/redux/hooks';
import { useChats, addChat } from '@/lib/firestoreHelpersClient';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const { chats, loading, error } = useChats(userEmail);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isApproved = useAppSelector(state => state.devConfig.isApproved);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);

    const handleAddChat = async () => {
        const result = await addChat({ userId: userEmail, turnState: 0 });
        if (result && result.chatId) {
            router.push(`/${result.chatId}`);
        }
    }

    if (!isApproved) return <div />

    return (
        <div className='flex flex-col h-screen py-0 overflow-x-hidden'>
            <div className='flex-1'>
                <button
                    onClick={handleAddChat}
                    className='bg-blue-500 text-white px-0 py-2 w-full rounded-md hover:bg-blue-600'
                >
                    Add Chat
                </button>
                <div className='flex flex-col py-4 space-y-2'>
                    {chats.map(chat => (
                        <ChatRow key={chat.id} chat={chat} />
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
