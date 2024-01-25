"use client"
import * as Constants from "shared/constants";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGenesisMessages, addChildConversation, deleteGenesisConversation } from "../../lib/firestoreHelpersClient";
import { useSession } from "next-auth/react";
import { ConversationRead } from "shared/typings";
import { useAppDispatch } from "../redux/hooks";
import { setGenesisConversationId } from "../redux/features/navigationSlice";
import Childbar from "./Childbar";


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
    const dispatch = useAppDispatch();
    const [showChildbar, setShowChildbar] = useState(false);


    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(conversation.id)); //ATTENTION: what if one id contains another id?
    }, [pathName, conversation.id]);


    const handleLinkClick = () => {
        dispatch(setGenesisConversationId(conversation.id));
    };


    const handleMouseEnter = () => {
        setShowChildbar(true);
    };

    const handleMouseLeave = () => {
        setShowChildbar(false);
    };


    const handleCreateChildConversation = async () => {
        try {
            if (userEmail) {
                const result = await addChildConversation({ genesisConversationId: conversation.id, conversation: { userId: userEmail, type: Constants.data, turnState: 0 } });
                if (result && result.data && result.data.conversationId) {
                    router.push(`/conversation/child/${result.data.conversationId}`);
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

    // transition-all duration-200 ease-out
    return (
        <div
            className={`relative flex items-center justify-center space-x-2 px-3 py-1 rounded-2xl 
            text-sm cursor-pointer text-gray-300 bg-slate-500
        ${active ? "" : "hover:bg-gray-700/70"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link href={href} passHref className="flex-1">
                <div
                    className="flex space-x-4"
                    onClick={handleLinkClick}

                >
                    <TrashIcon
                        className="h-6 w-6 text-gray-700 hover:text-red-700"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent Link navigation
                            handleDeleteGenesisConversation();
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
            {showChildbar && (
                <div className="absolute top-full left-0 z-10">
                    <Childbar conversationId={conversation.id} />
                </div>
            )}
        </div>
    );

}