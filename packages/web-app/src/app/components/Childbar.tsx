import { useChildConversations } from "@/lib/firestoreHelpersClient";
import { useRouter } from "next/navigation";

type Props = {
    conversationId: string;
}

export default function Childbar({ conversationId }: Props) {
    const { conversations, loading, error } = useChildConversations(conversationId);
    const router = useRouter();

    if (loading) {
        return <div>Loading child conversations...</div>;
    }

    if (error) {
        return <div>Error loading child conversations: {error.message}</div>;
    }

    const handleClick = (childConversationId: string) => {
        router.push(`/conversation/child/${childConversationId}`);
    }

    return (
        <div className="border border-gray-300 rounded-lg p-2 bg-white shadow-lg">
            {conversations.length > 0 ? (
                conversations.map((childConversation) => (
                    <div key={childConversation.id} className="p-2 hover:bg-gray-100" onClick={() => handleClick(childConversation.id)}>
                        {childConversation.id}
                    </div>
                ))
            ) : (
                <div>No child conversations found.</div>
            )}
        </div>
    );
}
