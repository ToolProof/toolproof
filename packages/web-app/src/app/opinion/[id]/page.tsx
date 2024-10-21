'use client';
import Chat from '@/components/chat/Chat';

type Props = {
    params: {
        id: string;
    }
}

export default function Opinion({ params: { id } }: Props) {

    return (
        <Chat params={{ id }} />
    );

}

