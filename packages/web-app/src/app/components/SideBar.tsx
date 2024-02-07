"use client"
import * as Constants from "shared/src/flow_0/constants";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation";
import ConversationRow from "./ConversationRow";
import { useGenesisConversations, addGenesisConversation, replaceSlashWithTilde } from "../../lib/firestoreHelpersClient";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUserEmail } from "@/lib/redux/features/devConfigSlice";
import { useAppSelector } from "@/lib/redux/hooks";
import { ConversationRead } from "shared/src/flow_0/typings";


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    const router = useRouter();
    const { conversations, loading } = useGenesisConversations(userEmail);
    const dispatch = useAppDispatch();

    const [conversationsToUse, setConversationsToUse] = useState(conversations);

    const foo = (conversationsPassed: ConversationRead[]): void => {
        if (conversationsPassed.length === 0) {
            setConversationsToUse(conversations);
        } else {
            const index = conversations.findIndex((conversation) => conversation.id === conversationsPassed[0].id);
            const conversationsToUseLocal = [...conversations.slice(0, index), ...conversationsPassed];
            setConversationsToUse(conversationsToUseLocal);
        }
    };

    useEffect(() => {
        if (JSON.stringify(conversations) !== JSON.stringify(conversationsToUse)) {
            setConversationsToUse(conversations);
          }
    }, [conversations, conversationsToUse]);    


    const isApproved = useAppSelector(state => state.devConfig.isApproved);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);


    const handleClick = async () => {
        if (userEmail) {
            try {
                const result = await addGenesisConversation({ userId: userEmail, type: Constants.META, turnState: 0, path: "" });
                if (result && result.path) {
                    router.push(`/conversation/${replaceSlashWithTilde(result.path)}`);
                } else {
                    console.error("Conversation creation did not return a valid ID");
                }
            } catch (err) {
                console.error("Failed to create conversation", err);
            }
        };
    }


    if (!isApproved) {
        return (
            <div></div>
        )
    }


    return (
        <div className="flex flex-col h-screen overflow-x-hidden">
            <button
                className="flex justify-center items-center h-12 bg-white text-black"
                onClick={handleClick}
            >
                <p>Create New Meta Conversation</p>
            </button>
            <div className="flex-1">
                <div className="flex flex-col space-y-2">
                    {loading &&
                        <div className="animate-pulse text-center text-white">Loading...</div>
                    }
                    {conversationsToUse.map((conversation) => {
                        return <ConversationRow key={conversation.id} conversation={conversation} foo={foo} />
                    })}
                </div>
            </div>
            {session && (
                <img
                    src={session?.user?.image || ""}
                    onClick={() => signOut()}
                    alt="Profile Picture"
                    className="h-12 w-12 rounded-full cursor-pointer mx-auto mb-2 hover:opacity-50"
                />
            )}
        </div>

    );
}
