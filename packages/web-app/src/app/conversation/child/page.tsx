"use client";
import Conversation from "../../components/Conversation";
import ConversationInput from "../../components/ConversationInput";
import { useChildConversation } from "@/lib/firestoreHelpersClient";


type Props = {
    params: {
        id: string;
    }
}


export default function ConversationPage({ params: { id } }: Props) {
    const { conversation } = useChildConversation(id, id);

    if (!conversation) { //ATTENTION: find a better way to handle this
        return (
            <div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <Conversation key={id} conversation={conversation} />
            </div>
            <div>
                <ConversationInput conversation={conversation} />
            </div>
        </div>
    );
}