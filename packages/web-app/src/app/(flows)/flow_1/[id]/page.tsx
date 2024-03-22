"use client";
import ChatDisplay from "@/flow_1/components/ChatDisplay";
import ChatInput from "@/flow_1/components/ChatInput";
import { useChat } from "@/flow_1/lib/firestoreHelpersClient";


type Props = {
    params: {
        id: string;
    }
}


export default function Chat({ params: { id } }: Props) {
    const { chat } = useChat(id);

    if (!chat) { //ATTENTION: find a better way to handle this
        return null;
    }
    
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-hidden bg-[#ffffff]">
                <ChatDisplay key={chat.id} chat={chat} />
            </div>
            <div className="w-full bg-[#80807a]">
                <ChatInput chat={chat} />
            </div>
        </div>
    );

}