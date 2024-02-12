import { db } from "shared/src/flow_0/firebaseClient";
import { doc, addDoc, serverTimestamp, collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ChatWrite, MessageWrite, ChatRead, MessageRead } from "shared/src/flow_0/typings";
import * as Constants from "shared/src/flow_0/constants";


export const addChat = async (chatWrite: ChatWrite) => {
  try {
    const docRef = await addDoc(collection(db, Constants.CHATS), chatWrite);
    return docRef.id;
  } catch {
    
  }
}

export const addMessage = async (chatId: string, messageWrite: MessageWrite) => {
  try {
    const docRef = await addDoc(collection(db, Constants.CHATS, chatId, Constants.MESSAGES), messageWrite);
    return docRef.id;
  } catch {

  }
}

export function useChat(chatId: string) {
  const chatRef = doc(db, chatId);
  const [chatSnapshot, loading, error] = useDocument(chatRef);

  const chat = chatSnapshot?.exists()
    ? {
      ...chatSnapshot.data(),
      id: chatSnapshot.id,
    } as ChatRead
    : null;

  return { chat, loading, error };
}

export const useMessages = (chatId: string) => {
  const messagesQuery = query(collection(db, Constants.CHATS, chatId, Constants.MESSAGES), orderBy(Constants.TIMESTAMP, Constants.ASC));
  const [messagesSnapshot, loading, error] = useCollection(messagesQuery);

  const messages = messagesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as MessageRead[];

  return [messages, loading, error];
}
