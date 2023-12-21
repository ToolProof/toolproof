"use client"
import { useSession, signOut } from "next-auth/react"
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { db } from "../../setup/firebaseClient";
import ConversationRow from "./ConversationRow";
import { useAlfa } from "./AlfaProvider";
import { useRouter } from "next/navigation";

function SideBar() {
    const { data: session } = useSession()
    const router = useRouter();
    const { isAlfa, setIsAlfa } = useAlfa();   

    const userEmail = session?.user?.email;

    const conversationsQuery = userEmail ? query(
        collection(db, "conversations"),
        where("userId", "==", userEmail),
        where("y", "==", isAlfa ? 1 : 2),
        orderBy("timestamp", "asc")
    ) : null;    

    const [conversations, isLoading] = useCollection(conversationsQuery);

    return (
        <div className="p-d flex flex-col h-screen">
            {
                userEmail == "renestavnes@hotmail.com" && (
                    <div className="flex divide-x divide-gray-300">
                        <button
                            onClick={() => {
                                setIsAlfa(true)
                                router.push("/")
                            }}
                            className={`flex-1 text-center py-2 ${isAlfa ? "bg-gray-300 text-gray-800" : "bg-gray-100 text-gray-600"} hover:bg-gray-500`}
                        >
                            Alfa
                        </button>
                        <button
                            onClick={() => {
                                setIsAlfa(false)
                                router.push("/")
                            }}
                            className={`flex-1 text-center py-2 ${!isAlfa ? "bg-gray-300 text-gray-800" : "bg-gray-100 text-gray-600"} hover:bg-gray-500`}
                        >
                            Beta
                        </button>
                    </div>
                )
            }
            <div className="flex-1">
                <div>
                    <div className="flex flex-col space-y-2">
                        {isLoading &&
                            <div className="animate-pulse text-center text-white">Loading...</div>
                        }
                        {/* Map through the conversation rows */}
                        {conversations?.docs.map((conversation) => {
                            const isAccepted = isAlfa ? true : conversation.data().turnState !== 0;
                            return <ConversationRow key={conversation.id} conversationId={conversation.id} isAccepted={isAccepted} isSigned={true} /> 
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

export default SideBar;