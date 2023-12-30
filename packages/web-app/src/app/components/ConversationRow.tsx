"use client"
import Link from "next/link";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";   
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

type Props = {
    conversationId: string;
    isSigned: boolean;
}

function ConversationRow({conversationId, isSigned}: Props) {
    const pathName = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [active, setActive] = useState(false);
    const href = isSigned ? `/conversation/${conversationId}` : `/conversation/invitee/${conversationId}`;
    const [messages] = useCollection(
        session && collection(db, "conversations", conversationId, "messages")
    )
    
    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversationId)); //ATTENTION: what if one id contains another id?
    }, [pathName,  conversationId]);

    const deleteConversation = async () => {
        await deleteDoc(doc(db, "conversations", conversationId)) //ATTENTION_DM
        router.replace("/")
    }
    
    return (
        <Link
            href={href}
            className={`conversationRow justify-center ${active && ""} ${!active && "hover:bg-gray-700/70"}`}
        >
            <div className="flex space-x-10">
                <ChatBubbleLeftIcon className="h-6 w-6 hover:opacity-50"/>
                <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                    {messages?.docs[0]?.data().content.slice(0, 20) + "..." || "Empty Conversation"}
                </p>
                <TrashIcon 
                    onClick={deleteConversation} 
                    className="h-6 w-6 text-gray-700 hover:text-red-700"
                />
            </div>
        </Link>
    );
}

export default ConversationRow;