"use client"
import Link from "next/link";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMessages, useConversation, deleteConversation } from "../../lib/firestoreHelpersClient";


type Props = {
    conversationId: string;
}

export default function ConversationRow({ conversationId }: Props) {
    const pathName = usePathname();
    const router = useRouter();
    const [active, setActive] = useState(false);
    const href = `/conversation/${conversationId}`;
    const {conversation} = useConversation(conversationId);
    const {messages} = useMessages(conversationId);
  

    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversationId)); //ATTENTION: what if one id contains another id?
    }, [pathName, conversationId]);



    const handleDeleteConversation = async () => {
        try {
            if (conversation?.parentId !== "base") {  
                // Delete the conversation
                await deleteConversation(conversationId);
                router.replace("/"); // Redirect after deletion
            }
        } catch (err) {
            console.error("Failed to delete conversation", err);
        }
    };


    return (
        <Link
            href={href}
            className={`conversationRow justify-center ${active && ""} ${!active && "hover:bg-gray-700/70"}`}
        >
            <div className="flex space-x-10">
                <ChatBubbleLeftIcon className="h-6 w-6 hover:opacity-50" />
                <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                    {messages && messages.length > 0 ?
                        `${messages[0].content.slice(0, 20)}...` :
                        "Empty Conversation"}
                </p>
                <TrashIcon
                    onClick={handleDeleteConversation}
                    className="h-6 w-6 text-gray-700 hover:text-red-700"
                />
            </div>
        </Link>
    );
}