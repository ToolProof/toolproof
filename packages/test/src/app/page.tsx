"use client";
import Conversation from "./components/CO";
import ConversationInput from "./components/CI";

function ConversationPage() {

    const id = "vvrMuUswgrTvRj3yzIIN";

    return (
        <div className="bg-white flex flex-col h-screen overflow-hidden relative">
            <div className="flex-1">
                <Conversation key={id} conversationId={id} />
            </div>
            <div className="w-full">
                <ConversationInput conversationId={id} />
            </div>
        </div>
    );
}

export default ConversationPage;