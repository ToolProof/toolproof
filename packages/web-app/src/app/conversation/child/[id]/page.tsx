"use client";
import ConversationDisplay from "@/app/components/ConversationDisplay";
import ConversationInput from "@/app/components/ConversationInput";
import { useChildConversation, useChildMessages, addChildMessage } from "@/lib/firestoreHelpersClient";
import { useAppSelector } from "@/app/redux/hooks";
import { MessageWrite } from "shared/typings";


type Props = {
    params: {
        id: string;
    }
}


export default function ConversationPage({ params: { id } }: Props) {
    const genesisConversationId = useAppSelector(state => state.navigation.genesisConversationId);
    const { conversation } = useChildConversation(genesisConversationId, id);
    const { messages } = useChildMessages(genesisConversationId, id);
    console.log(genesisConversationId ? genesisConversationId : "No genesisConversationId")


    const handleAddMessage = (message: MessageWrite) => addChildMessage({ genesisConversationId, childConversationId: id, message });


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
                <ConversationInput conversation={conversation} technicalDebt={{ addMessage: handleAddMessage, genesisConversationId: genesisConversationId }} />
            </div>
        </div>
    );

}