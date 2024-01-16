"use client";
import Conversation from "../../components/Conversation";
import ConversationInput from "../../components/ConversationInput";


type Props = {
    params: {
        id: string;
    }
}


export default function ConversationPage({ params: { id } }: Props) {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <Conversation key={id} conversationId={id} />
            </div>
            <div>
                <ConversationInput conversationId={id} />
            </div>
        </div>
    );
}