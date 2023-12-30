"use client";
import Conversation from "../../components/Conversation-Signed";
import ConversationInput from "../../components/ConversationInput-Signed";

type Props = {
    params: {
        id: string;
    }
}

function ConversationPage({ params: { id } }: Props) {
    return (
        <div className="bg-white flex flex-col h-screen overflow-hidden relative">
            <div className="flex-1 overflow-auto my-10">
                <Conversation key={id} conversationId={id} />
            </div>
            <div className="w-full">
                <ConversationInput conversationId={id} />
            </div>
        </div>
    );
}

export default ConversationPage;