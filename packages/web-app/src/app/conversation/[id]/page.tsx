"use client";
import Conversation from "../../components/Conversation";
import ConversationInput from "../../components/ConversationInput";
import { useConversation } from "@/lib/firestoreHelpersClient";
import { ConversationRead } from "shared/typings";


type Props = {
    params: {
        id: string;
    }
}


export default function ConversationPage({ params: { id } }: Props) {
    const [conversation] = useConversation(ref);
    

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