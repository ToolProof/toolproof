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
        <div className="flex flex-col h-screen overflow-hidden relative">
            <Conversation key={id} conversationId={id} />
            <div className="absolute bottom-0 w-full">
                <ConversationInput conversationId={id} />
            </div>
        </div>
    );
}


export default ConversationPage;