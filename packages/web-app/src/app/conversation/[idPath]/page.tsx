"use client";
import ConversationDisplay from "@/app/components/ConversationDisplay";
import ConversationInput from "@/app/components/ConversationInput";
import { useConversation, replaceTildeWithSlash } from "@/lib/firestoreHelpersClient";


type PageProps = {
    idPath: string;
};


export default function Conversation({ params }: PageProps) {
    const { conversation } = useConversation(replaceTildeWithSlash(idPath));


    if (!conversation) { //ATTENTION: find a better way to handle this
        return (
            <div>
            </div>
        );
    }

    return ( //ATTENTION: since ConversationInput doesn't need messages, consider wrapping it in a useMemo
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <ConversationDisplay key={conversation.path} conversation={conversation} />
            </div>
            <div>
                <ConversationInput conversation={conversation} />
            </div>
        </div>
    );

}