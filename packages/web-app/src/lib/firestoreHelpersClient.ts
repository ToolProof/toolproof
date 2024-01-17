import { addDoc, deleteDoc, serverTimestamp, writeBatch, doc, query, collection, where, orderBy, limit } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "shared/firebaseClient";
import { MessageRead } from "shared/typings";
import { MessageWrite } from "shared/typings";
import { ConversationWrite } from "shared/typings";
import { ConversationRead } from "shared/typings";


export function useMessages(conversationId: string) {
    const messagesQuery = conversationId
        ? query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"), limit(100))
        : null;

    const [messageSnapshots, loading, error] = useCollection(messagesQuery);

    const messages = messageSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as MessageRead
    )) ?? [];

    return { messages, loading, error };
};


export function useConversations(userEmail: string) {
    const conversationsQuery = query(collection(db, "conversations"), where("userId", "==", userEmail), orderBy("timestamp", "asc"), limit(100));

    const [conversationSnapshots, loading, error] = useCollection(conversationsQuery);

    const conversations = conversationSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ConversationRead
    )) ?? [];


    return { conversations, loading, error };
}


export function useConversation(conversationId: string) {
    const conversationQuery = conversationId
        ? doc(db, "conversations", conversationId)
        : null;

    const [conversationSnapshot, loading, error] = useDocument(conversationQuery);

    const conversation = { id: conversationSnapshot?.id, ...conversationSnapshot?.data() } as ConversationRead;

    return { conversation, loading, error };
}


export async function addConversation(conversation: ConversationWrite) {
    try {
        const docRef = await addDoc(collection(db, "conversations"), {
            ...conversation,
            timestamp: serverTimestamp(),
        });
        return { data: { conversationId: docRef.id } }; // Return the conversation ID
    } catch (err) {
        return { error: err };
    }
}


export async function addMessage({ conversationId, message }: { conversationId: string, message: MessageWrite }) {
    try {
        const batch = writeBatch(db);

        // Message document reference
        const messageRef = doc(collection(db, "conversations", conversationId, "messages"));
        batch.set(messageRef, {
            ...message,
            timestamp: serverTimestamp(),
        });

        // Conversation document reference
        const conversationRef = doc(db, "conversations", conversationId);
        batch.update(conversationRef, { turnState: -1 });

        // Commit the batch
        await batch.commit();
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}


export async function deleteConversation(conversationId: string) {
    try {
        await deleteDoc(doc(db, "conversations", conversationId));
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}