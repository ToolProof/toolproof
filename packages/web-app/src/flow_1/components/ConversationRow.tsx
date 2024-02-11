"use client"
import * as Constants from "shared/src/flow_0/constants";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useMessages } from "@/flow_1/lib/firestoreHelpersClient";
import { ConversationRead } from "shared/src/flow_0/typings";


type Props = {
    conversation: ConversationRead;
}


export default function ConversationRow({ conversation }: Props) {
    const pathName = usePathname();
    const [active, setActive] = useState(false);
    const href = `/flow_1/${conversation.idPath}`; //ATTENTION: hardcoded flow_1
    //const href = `/flow_${index}/${conversation.idPath}`;
    const { messages } = useMessages(conversation.path);


    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversation.id)); //ATTENTION: what if one id contains another id?
    }, [pathName, conversation.id]);

    const handleMouseEnter = () => {
        
    }

    const handleMouseLeave = () => {
        
    }


    // transition-all duration-200 ease-out // 
    return (
        <div
            className={`relative flex items-center justify-center space-x-2 px-3 py-1 rounded-2xl 
            text-sm cursor-pointer text-gray-300 bg-slate-500
            ${active ? "" : ""}
        ${conversation.type === Constants.DATA ? "bg-black" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href={href}
                passHref className="flex-1">
                <div
                    className="flex space-x-4"
                // Could set navigationState here
                >
                    <TrashIcon
                        className="h-6 w-6 text-gray-700 hover:text-red-700"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent Link navigation
                            //handleDeleteConversation();
                        }}
                    />
                    <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                        {messages && messages.length > 0 ?
                            `${messages[0].content.slice(0, 20)}` :
                            "Empty Conversation"}
                    </p>
                </div>
            </Link>
        </div>
    );

}