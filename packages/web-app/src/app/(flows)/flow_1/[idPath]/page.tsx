"use client";
import ChatDisplay from "@/flow_1/components/ChatDisplay";
import ChatInput from "@/flow_1/components/ChatInput";
import { useChat, replaceTildeWithSlash } from "@/flow_1/lib/firestoreHelpersClient";


type Props = {
    params: {
        idPath: string;
    }
}


export default function Chat({ params: { idPath } }: Props) {
    const { chat } = useChat(replaceTildeWithSlash(idPath));


    if (!chat) { //ATTENTION: find a better way to handle this
        return (
            <div>
            </div>
        );
    }

    return ( 
        <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <ChatDisplay key={chat.path} chat={chat} />
            </div>
            <div>
                <ChatInput chat={chat} />
            </div>
        </div>
    );

}