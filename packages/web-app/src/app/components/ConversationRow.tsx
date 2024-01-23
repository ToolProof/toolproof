"use client"
import * as Constants from "shared/constants";
import Link from "next/link";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGenesisMessages, addChildConversation, deleteGenesisConversation } from "../../lib/firestoreHelpersClient";
import { useSession } from "next-auth/react";
import { ConversationRead } from "shared/typings";


type Props = {
    conversation: ConversationRead;
}


export default function ConversationRow({ conversation }: Props) {
    const pathName = usePathname();
    const router = useRouter();
    const [active, setActive] = useState(false);
    const href = `/conversation/${conversation.id}`;
    const { messages } = useGenesisMessages(conversation.id);
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";


    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversation.id)); //ATTENTION: what if one id contains another id?
    }, [pathName, conversation.id]);



    const handleCreateChildConversation = async () => {
        try {
            if (userEmail) {
                const result = await addChildConversation({ genesisConversationId: conversation.id, conversation: { userId: userEmail, type: Constants.data, turnState: 0 } });
                if (result && result.data && result.data.conversationId) {
                    router.push(`/conversation/${result.data.conversationId}`);
                } else {
                    console.error("Conversation creation did not return a valid ID");
                }
            }
        } catch (err) {
            console.error("Failed to create conversation", err);
        }
    }


    const handleDeleteGenesisConversation = async () => {
        try {
            if (true) {   
                // Delete the conversation
                await deleteGenesisConversation(conversation.id);
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
                <TrashIcon
                    className="h-6 w-6 text-gray-700 hover:text-red-700"
                    onClick={handleDeleteGenesisConversation}
                />

                <p className="flex-1 hover:opacity-50 hidden md:inline-flex truncate">
                    {messages && messages.length > 0 ?
                        `${messages[0].content.slice(0, 20)}...` :
                        "Empty Conversation"}
                </p>
                <ChatBubbleLeftIcon 
                    className="h-6 w-6 hover:opacity-50"
                    onClick={handleCreateChildConversation}
                />
            </div>
        </Link>
    );

}