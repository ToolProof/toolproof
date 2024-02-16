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
        <div className="flex-1 flex flex-col m-4 overflow-hidden bg-[#3344ff]">
            <div className="flex-1 my-0">
                <ChatDisplay key={chat.id} chat={chat} />
            </div>
            <div>
                <ChatInput chat={chat} />
            </div>
        </div>
    );

}