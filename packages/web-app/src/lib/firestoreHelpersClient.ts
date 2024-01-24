import { setDoc, deleteDoc, serverTimestamp, writeBatch, doc, query, collection, where, orderBy } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db } from "shared/firebaseClient";
import { MessageRead } from "shared/typings";
import { MessageWrite } from "shared/typings";
import { ConversationWrite } from "shared/typings";
import { ConversationRead } from "shared/typings";
import * as Constants from "shared/constants";


export function useGenesisConversations(userEmail: string) {
    const conversationsQuery = query(
        collection(db, Constants.conversations),
        where(Constants.userId, "==", userEmail),
        orderBy(Constants.timestamp, Constants.asc)
    );

    const [conversationSnapshots, loading, error] = useCollection(conversationsQuery);

    const conversations = conversationSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ConversationRead)) ?? [];

    return { conversations, loading, error };
}


export function useChildConversations(conversationId: string) {
    const conversationsQuery = query(
        collection(db, Constants.conversations, conversationId, Constants.conversations),
        orderBy(Constants.timestamp, Constants.asc)
    );

    const [conversationSnapshots, loading, error] = useCollection(conversationsQuery);

    const conversations = conversationSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ConversationRead)) ?? [];

    return { conversations, loading, error };
}


export function useGenesisConversation(conversationId: string) {
    const conversationRef = doc(db, Constants.conversations, conversationId);
    const [conversationSnapshot, loading, error] = useDocument(conversationRef);

    const conversation = conversationRef
        ? { id: conversationRef.id, ...conversationSnapshot?.data() } as ConversationRead
        : null;

    return { conversation, loading, error };
}


export function useChildConversation(genesisConversationId: string, childConversationId: string) {
    const conversationRef = doc(db, Constants.conversations, genesisConversationId, Constants.conversations, childConversationId);
    const [conversationSnapshot, loading, error] = useDocument(conversationRef);

    const conversation = conversationRef
        ? { id: conversationRef.id, ...conversationSnapshot?.data() } as ConversationRead
        : null;

    return { conversation, loading, error };
}


export function useGenesisMessages(conversationId: string) {
    const messagesQuery = query(
        collection(db, Constants.conversations, conversationId, Constants.messages),
        orderBy(Constants.timestamp, Constants.asc)
    );

    const [messageSnapshots, loading, error] = useCollection(messagesQuery);

    const messages = messageSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as MessageRead)) ?? [];

    return { messages, loading, error };
};


export function useChildMessages(genesisConversationId: string, childConversationId: string) {
    const messagesQuery = query(
        collection(db, Constants.conversations, genesisConversationId, Constants.conversations, childConversationId, Constants.messages),
        orderBy(Constants.timestamp, Constants.asc)
    );

    const [messageSnapshots, loading, error] = useCollection(messagesQuery);

    const messages = messageSnapshots?.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as MessageRead)) ?? [];

    return { messages, loading, error };
};


export async function addGenesisConversation({ conversation }: { conversation: ConversationWrite }) {
    try {
        const collectionRef = collection(db, Constants.conversations);
        const newDocRef = doc(collectionRef); // Generate a new document reference

        // Create the conversation with server-side timestamp
        await setDoc(newDocRef, {
            ...conversation,
            timestamp: serverTimestamp(), // Set server-side timestamp
        });

        return { data: { conversationId: newDocRef.id } };
    } catch (err) {
        return { error: err };
    }
}


export async function addChildConversation({ genesisConversationId, conversation }: { genesisConversationId: string, conversation: ConversationWrite }) {
    try {
        const collectionRef = collection(db, Constants.conversations, genesisConversationId, Constants.conversations);
        const newDocRef = doc(collectionRef); // Generate a new document reference

        // Create the child conversation with server-side timestamp
        await setDoc(newDocRef, {
            ...conversation,
            timestamp: serverTimestamp(), // Set server-side timestamp
        });

        return { data: { conversationId: newDocRef.id } };
    } catch (err) {
        return { error: err };
    }
}


export async function addGenesisMessage({ conversationId, message }: { conversationId: string, message: MessageWrite }) {
    try {
        const batch = writeBatch(db);

        const conversationRef = doc(db, Constants.conversations, conversationId);

        // Message document reference for either genesis or child conversation
        const messageRef = doc(collection(conversationRef, Constants.messages));
        batch.set(messageRef, {
            ...message,
            timestamp: serverTimestamp(),
        });

        // Update the conversation document
        batch.update(conversationRef, { turnState: -1 });

        // Commit the batch
        await batch.commit();
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}


export async function addChildMessage({ genesisConversationId, childConversationId, message }: { genesisConversationId: string, childConversationId: string, message: MessageWrite }) {
    try {
        const batch = writeBatch(db);

        const conversationRef = doc(db, Constants.conversations, genesisConversationId, Constants.conversations, childConversationId);

        // Message document reference for either genesis or child conversation
        const messageRef = doc(collection(conversationRef, Constants.messages));
        batch.set(messageRef, {
            ...message,
            timestamp: serverTimestamp(),
        });

        // Update the conversation document
        batch.update(conversationRef, { turnState: -1 });

        // Commit the batch
        await batch.commit();
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}


export async function deleteGenesisConversation(conversationId: string) {
    try {
        const conversationRef = doc(db, Constants.conversations, conversationId);
        await deleteDoc(conversationRef);
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}


export async function deleteChildConversation(genesisConversationId: string, childConversationId: string) {
    try {
        const conversationRef = doc(db, Constants.conversations, genesisConversationId, Constants.conversations, childConversationId);
        await deleteDoc(conversationRef);
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}