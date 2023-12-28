"use client"
import { useDocument } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import ConversationRow from "./ConversationRow";
import { usePathname } from "next/navigation";

function SideBarUnsigned() {
    const pathName = usePathname();
    const conversationId = pathName?.split("/").pop() || ""; // Assuming the last segment is the conversationId

    const conversationRef = conversationId ? doc(db, "conversations", conversationId) : null;
    const [conversationSnapshot, loading, error] = useDocument(conversationRef);

    if (loading) {
        return <div className="animate-pulse text-center text-white">Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const conversationData = conversationSnapshot?.data();

    return (
        <div className="p-d flex flex-col h-screen">
            <div className="flex-1">
                {conversationData && (
                    <ConversationRow key={conversationId} conversationId={conversationId} isAccepted={conversationData.turnState !== 0} isSigned={false}/>
                )}
            </div>
            {/* Other UI elements as needed */}
        </div>
    );
}

export default SideBarUnsigned;
