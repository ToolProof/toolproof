import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "shared/firebaseClient";
import { MessageRead } from "shared/typings";

type Props = {
    conversationId: string;
}

export default function Conversation({ conversationId }: Props) {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    console.log(messagesRef);
    //const [messageSnapshots, loading] = useCollection(collection(db, "conversations", conversationId, "messages"));
    //const messages = messageSnapshots?.docs.map((doc) => doc.data() as MessageRead) ?? [];

    return (
        <div className="bg-white">
            {/* {loading && <p>Loading...</p>}
            {messages.length > 0 ? <p>{messages[0].content}</p> : <p>No messages</p>} */}
            Hi, I'm Conversation
        </div>
    );

}