"use client"
import * as Constants from "shared/constants";
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation";
import ConversationRow from "./ConversationRow";
import { useGenesisConversations, addGenesisConversation } from "../../lib/firestoreHelpersClient";


export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    const router = useRouter();
    const { conversations, loading } = useGenesisConversations(userEmail);


    const handleClick = async () => {
        if (userEmail) {
            try {
                const result = await addGenesisConversation({ userId: userEmail, type: Constants.META, turnState: 0, path: "" });
                if (result && result.path) {
                    router.push(`/conversation/${result.path}`);
                } else {
                    console.error("Conversation creation did not return a valid ID");
                }
            } catch (err) {
                console.error("Failed to create conversation", err);
            }
        };
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
                    {conversations.map((conversation) => {
                        return <ConversationRow key={conversation.id} conversation={conversation} />
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
