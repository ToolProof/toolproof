"use client"
//import * as Constants from "shared/src/flow_0/constants";
// import Link from "next/link";
// import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
//import { useMessages } from "@/flow_1/lib/firestoreHelpersClient";
import { ChatRead } from "shared/src/flow_0/typings";


type Props = {
    chat: ChatRead;
}


export default function ChatRow({ chat }: Props) {
    const pathName = usePathname();
    const [active, setActive] = useState(false);
    //const href = `/flow_1/${chat.idPath}`; //ATTENTION: hardcoded flow_1
    //const href = `/flow_${index}/${chat.idPath}`;
    //const { messages } = useMessages(chat.path);


    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(chat.id)); //ATTENTION: what if one id contains another id?
    }, [pathName, chat.id]);

    const handleMouseEnter = () => {

    }

    const handleMouseLeave = () => {

    }


    // transition-all duration-200 ease-out // ${chat.type === Constants.DATA ? "bg-black" : ""}
    return (
        <div
            className={`relative flex items-center justify-center space-x-2 px-3 py-1 rounded-2xl 
            text-sm cursor-pointer text-gray-300 bg-slate-500
            ${active ? "" : ""}
        `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/*
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
                            //handleDeleteChat();
                        }}
                    />
                    <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                        {messages && messages.length > 0 ?
                            `${messages[0].content.slice(0, 20)}` :
                            "Empty Chat"}
                    </p>
                </div>
            </Link>
                        */}
        </div>
    );

}