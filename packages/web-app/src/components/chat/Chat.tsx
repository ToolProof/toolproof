'use client';
import ChatDisplay from '@/components/chat/ChatDisplay';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/lib/firestoreHelpersClient';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Props = {
    params: {
        id: string;
    }
}

export default function Chat({ params: { id } }: Props) {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const router = useRouter();
    const { chat } = useChat(id);

    useEffect(() => {
        if (!userEmail) {
            // Redirect to '/' if no user is signed in
            router.push('/');
        }
    }, [router, userEmail]);

    if (!chat) { // ATTENTION: find a better way to handle this
        return null;
    }

    return (
        <div className='flex flex-col h-full overflow-hidden'>
            <div className='flex-grow overflow-hidden bg-[#ffffff]'>
                <ChatDisplay key={chat.id} chat={chat} />
            </div>
            <div className='flex justify-center items-center w-full'>
                <div className='w-[50%] bg-[#80807a] flex justify-center items-center'>
                    <ChatInput chat={chat} />
                </div>
            </div>
        </div>
    );

}

