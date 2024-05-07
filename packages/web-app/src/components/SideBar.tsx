'use client';
import ChatRow from './ChatRow';
import { useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/devConfigSlice';
import { useAppSelector } from '@/redux/hooks';
import { useChats, addChat } from '@/lib/firestoreHelpersClient';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';


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

    /* useEffect(() => {
        // Redirect to the user's first chat
        const redirectToUsersFirstChat = async () => { 
            if (!userEmail || !isApproved) return;
            const usersFirstChatId = await getIdOfUsersFirstChat(userEmail);
            if (!usersFirstChatId) {
                // User has no chats, so create one and redirect
                const result = await addChat({ userId: userEmail, turnState: 0 });
                if (result && result.chatId) {
                    router.push(`/${result.chatId}`);
                }
            } else {
                // User has a chat, so redirect
                router.push(`/${usersFirstChatId}`);
            }
        }
        redirectToUsersFirstChat();
    }, [userEmail, isApproved, router]); */


    const handleAddChat = async () => {
        const result = await addChat({ userId: userEmail, turnState: 0 });
        if (result && result.chatId) {
            router.push(`/${result.chatId}`);
        }
    }

    if (!isApproved) return <div />

    return (
        <div className='flex flex-col h-screen py-4 overflow-x-hidden'>
            <div className='flex-1'>
                <button
                    onClick={handleAddChat}
                    className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                >
                    Add Chat
                </button>
                <div className='flex flex-col space-y-2'>
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
