import { db } from "shared/firebaseClient";
import { doc, setDoc, addDoc, deleteDoc, collection, query, where, orderBy } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ConversationWrite, MessageWrite, ConversationRead, MessageRead } from "shared/typings";
import * as Constants from "shared/constants";


export const addGenesisConversation = async (conversationWrite: ConversationWrite) => {
  try {
    const docRef = doc(collection(db, Constants.CONVERSATIONS));
    const newPath = `${Constants.CONVERSATIONS}/${docRef.id}`;
    conversationWrite.path = newPath;
    await setDoc(docRef, conversationWrite);
    console.log("Document added successfully with path:", conversationWrite.path);
    return { path: newPath }
  } catch (error) {
    console.error("Error adding document: ", error);
    return "";
  }
};


export const addChildConversation = async (parentPath: string, conversationWrite: ConversationWrite) => {
  try {
    const docRef = doc(collection(db, parentPath, Constants.CONVERSATIONS));
    const newPath = `${parentPath}/${Constants.CONVERSATIONS}/${docRef.id}`;
    conversationWrite.path = newPath;
    await setDoc(docRef, conversationWrite);
    console.log("Document added successfully with path:", conversationWrite.path);
    return { path: newPath }
  } catch (error) {
    console.error("Error adding document: ", error);
    return "";
  }
};


export async function deleteConversation(path: string) {
    try {
        const conversationRef = doc(db, path);
        await deleteDoc(conversationRef);
        return { data: "ok" };
    } catch (err) {
        return { error: err };
    }
}


export const addMessage = async (path: string, messageWrite: MessageWrite) => {
  try {
    await addDoc(collection(db, path, Constants.MESSAGES), messageWrite);
    console.log("Document added successfully");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}


export const useGenesisConversations = (userEmail: string) => {
  const [value, loading, error] = useCollection(
    query(collection(db, Constants.CONVERSATIONS), where(Constants.USERID, "==", userEmail), orderBy(Constants.TIMESTAMP))
  );

  const conversations = value?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as ConversationRead)) || [];

  return { conversations, loading, error };
};


export const useChildConversations = (path: string) => {
  const [value, loading, error] = useCollection(
    query(collection(db, path, Constants.CONVERSATIONS), orderBy(Constants.TIMESTAMP))
  );

  const conversations = value?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as ConversationRead)) || [];

  return { conversations, loading, error };
};


export function useConversation(path: string) {
    const conversationRef = doc(db, path);
    const [conversationSnapshot, loading, error] = useDocument(conversationRef);

    const conversation = conversationSnapshot?.exists()
        ? { id: conversationSnapshot.id, ...conversationSnapshot.data() } as ConversationRead
        : null;

    return { conversation, loading, error };
}


export const useMessages = (path: string) => {
  const [value, loading, error] = useCollection(query(
    collection(db, path, Constants.MESSAGES), orderBy(Constants.TIMESTAMP))
  );

  const messages = value?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as MessageRead)) || [];

  return { messages, loading, error };
};

