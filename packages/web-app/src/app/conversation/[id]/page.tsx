"use client";
import ConversationDisplay from "@/app/components/ConversationDisplay";
import ConversationInput from "@/app/components/ConversationInput";
import { useGenesisConversation, useGenesisMessages, addGenesisMessage } from "@/lib/firestoreHelpersClient";
import { MessageWrite } from "shared/typings";


type Props = {
    params: {
        id: string;
    }
}


export default function ConversationPage({ params: { id } }: Props) {
    const { conversation } = useGenesisConversation(id);
    const { messages } = useGenesisMessages(id);

    const handleAddMessage = (message: MessageWrite) => addGenesisMessage({ conversationId: id, message });
      

    if (!conversation) { //ATTENTION: find a better way to handle this
        return (
            <div>
            </div>
        );
    }

    return ( //ATTENTION: since ConversationInput doesn't need messages, consider wrapping it in a useMemo
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <ConversationDisplay key={id} conversation={conversation} messages={messages} />
            </div>
            <div>
                <ConversationInput conversation={conversation} navigationCookie={{ addMessage: handleAddMessage, genesisConversationId: "" }} />
            </div>
        </div>
    );
    
}