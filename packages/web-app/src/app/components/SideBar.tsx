"use client"
import { useSession, signOut } from "next-auth/react"
import ConversationRow from "./ConversationRow";
import { useConversations } from "../../lib/firestoreHelpersClient";

export default function SideBar() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    const { conversations, loading } = useConversations(userEmail);
    
    return (
        <div className="p-d flex flex-col h-screen">
            <div className="flex-1">
                <div>
                    <div className="flex flex-col space-y-2">
                        {loading &&
                            <div className="animate-pulse text-center text-white">Loading...</div>
                        }
                        {conversations.map((conversation) => {
                            return <ConversationRow key={conversation.id} conversationId={conversation.id} />
                        })}
                    </div>
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
