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
        return (
            <div>
            </div>
        );
    }

    return ( 
        <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <ChatDisplay key={chat.id} chat={chat} />
            </div>
            <div>
                <ChatInput chat={chat} />
            </div>
        </div>
    );

}