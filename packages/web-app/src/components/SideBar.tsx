'use client'
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation';
//import ChatRow from './ChatRow';
import { useAppDispatch } from '@/redux/hooks';
import { setUserEmail } from '@/redux/features/devConfigSlice';
import { useAppSelector } from '@/redux/hooks';
import { getFirstUserChatId, addChat } from '@/lib/firestoreHelpersClient';


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const isApproved = useAppSelector(state => state.devConfig.isApproved);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);


    useEffect(() => {
        const foo = async () => { // ATTENTION: find better name
            if (!userEmail) return;
            const firstUserChatId = await getFirstUserChatId(userEmail);
            if (!firstUserChatId) {
                //console.log('User has no chats');
                const result = await addChat({ userId: userEmail, turnState: 0 });
                if (result && result.chatId) {
                    router.push(`/${result.chatId}`);
                }
            } else {
                //console.log('User has chats');
                router.push(`/${firstUserChatId}`);
            }
        }
        foo();
    }, [userEmail, router]);

    if (!isApproved) {
        return (
            <div></div>
        )
    }

    return (
        <div className='flex flex-col h-screen py-4 overflow-x-hidden'>
            <div className='flex-1'>
                <div className='flex flex-col space-y-2'>
                    {/* <ChatRow /> */}
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
