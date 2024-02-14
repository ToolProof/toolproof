import { db } from "shared/src/flow_0/firebaseClient";
import { doc, addDoc, getDocs, serverTimestamp, collection, query, orderBy, where, limit } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ChatWrite, MessageWrite, ChatRead, MessageRead, MessagePinecone } from "shared/src/flow_0/typings";
import * as Constants from "shared/src/flow_0/constants";


export const addChat = async (chatWrite: ChatWrite) => {
  try {
    const docRef = await addDoc(collection(db, Constants.CHATS), {
      ...chatWrite,
      [Constants.TIMESTAMP]: serverTimestamp(),
    });
    return { chatId: docRef.id };
  } catch(e) {
    console.error(e);
  }
}

export const addMessage = async (chatId: string, messageWrite: MessageWrite): Promise<MessagePinecone> => {
  try {
    const docRef = await addDoc(collection(db, Constants.CHATS, chatId, Constants.MESSAGES), {
      ...messageWrite,
      [Constants.TIMESTAMP]: serverTimestamp(),
    });
    return { id: docRef.id, ...messageWrite };
  } catch(e) {
    console.error(e);
    throw new Error("An error occurred while adding message");
  }
}

export function useChat(chatId: string) {
  const chatRef = doc(db, Constants.CHATS, chatId);
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
  })) as MessageRead[] || [];

  return { messages, loading, error };
}

export async function getFirstUserChatId(userId: string) {
  const q = query(
    collection(db, Constants.CHATS),
    where(Constants.USERID, "==", userId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Assuming there is at least one document, return its ID
    return querySnapshot.docs[0].id;
  } else {
    // Return null or an empty string to indicate no documents found
    return null; // or return '';
  }
}
