"use client"
import * as Constants from "shared/src/flow_0/constants";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMessages, addChildConversation, deleteConversation, replaceSlashWithTilde, useChildConversations } from "@/lib/firestoreHelpersClient";
import { useSession } from "next-auth/react";
import { ConversationRead } from "shared/src/flow_0/typings";
import Childbar from "./Childbar";


type Props = {
    conversation: ConversationRead;
    foo: (conversationsPassed: ConversationRead[]) => void;
}


export default function ConversationRow({ conversation, foo }: Props) {
    const pathName = usePathname();
    const router = useRouter();
    const [active, setActive] = useState(false);
    const href = `/conversation/${conversation.idPath}`;
    const { messages } = useMessages(conversation.path);
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    const [showChildbar, ] = useState(false); //setShowChildbar

    const { conversations: childConversations } = useChildConversations(conversation.path);
    const childernAccompanied = [conversation, ...childConversations];


    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversation.id)); //ATTENTION: what if one id contains another id?
    }, [pathName, conversation.id]);


    const handleMouseEnter = () => {
        //setShowChildbar(true);
       foo(childernAccompanied);
    };

    const handleMouseLeave = () => {
        //setShowChildbar(false);
        foo([]);
    };


    const handleCreateChildConversation = async () => {
        try {
            if (userEmail) {
                const result = await addChildConversation(conversation.path, { userId: userEmail, type: Constants.DATA, turnState: 0, path: "" });
                if (result && result.path) {
                    router.push(`/conversation/${replaceSlashWithTilde(result.path)}`);
                } else {
                    console.error("Conversation creation did not return a valid ID");
                }
            }
        } catch (err) {
            console.error("Failed to create conversation", err);
        }
    }


    const handleDeleteConversation = async () => {
        try {
            if (true) {
                // Delete the conversation
                await deleteConversation(conversation.path);
                router.replace("/"); // Redirect after deletion
            }
        } catch (err) {
            console.error("Failed to delete conversation", err);
        }
    };

    // transition-all duration-200 ease-out // ${active ? "" : "hover:bg-gray-700/70"}
    return (
        <div
            className={`relative flex items-center justify-center space-x-2 px-3 py-1 rounded-2xl 
            text-sm cursor-pointer text-gray-300 bg-slate-500
        
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
                            handleDeleteConversation();
                        }}
                    />
                    <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                        {messages && messages.length > 0 ?
                            `${messages[0].content.slice(0, 20)}...` :
                            "Empty Conversation"}
                    </p>
                </div>
            </Link>
            <div
                className="flex justify-center items-center h-12 w-12"
                onClick={handleCreateChildConversation}
            >
                <img src="  /icons/double_arrow.png" />
            </div>
            {/* Childbar */}
            {(showChildbar && false) && (
                <div className="absolute top-full left-0 z-10">
                    <Childbar conversation={conversation} />
                </div>
            )}
        </div>
    );

}