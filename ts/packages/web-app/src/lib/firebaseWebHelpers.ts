import * as CONSTANTS from 'shared/src/constants';
import { ChatWrite, MessageWrite, ChatRead, MessageRead } from 'shared/src/typings';
import { db } from '@/lib/firebaseWebInit';
import { doc, addDoc, getDocs, deleteDoc, serverTimestamp, collection, query, orderBy, where, limit } from 'firebase/firestore';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';


export const addChat = async (chatWrite: ChatWrite) => {
  try {
    const docRef = await addDoc(collection(db, CONSTANTS.chats), {
      ...chatWrite,
      [CONSTANTS.timestamp]: serverTimestamp(),
    });
    return { chatId: docRef.id };
  } catch (e) {
    console.error(e);
  }
}


export const deleteChat = async (chatId: string) => {
  try {
    console.log('Deleting chat with ID:', chatId);
    await deleteDoc(doc(db, CONSTANTS.chats, chatId));
  } catch (e) {
    console.error(e);
  }
}


export const addMessage = async (chatId: string, messageWrite: MessageWrite): Promise<Omit<MessageRead, 'timestamp'>> => {
  try {
    const docRef = await addDoc(collection(db, CONSTANTS.chats, chatId, CONSTANTS.messages), {
      ...messageWrite,
      [CONSTANTS.timestamp]: serverTimestamp(),
    });
    return { id: docRef.id, ...messageWrite };
  } catch (e) {
    console.error(e);
    throw new Error('An error occurred while adding message');
  }
}


export function useChats(userId: string) {
  const chatsQuery = query(collection(db, CONSTANTS.chats), where(CONSTANTS.userId, '==', userId), limit(10));
  const [chatsSnapshot, loading, error] = useCollection(chatsQuery);

  const chats = chatsSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ChatRead[] || [];

  return { chats, loading, error };
}


export function useChat(chatId: string) { // ATTENTION: be consistent with function syntax
  const chatRef = doc(db, CONSTANTS.chats, chatId);
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
  const messagesQuery = query(collection(db, CONSTANTS.chats, chatId, CONSTANTS.messages), orderBy(CONSTANTS.timestamp, CONSTANTS.asc));
  const [messagesSnapshot, loading, error] = useCollection(messagesQuery);

  const messages = messagesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as MessageRead[] || [];

  return { messages, loading, error };
}


export async function getIdOfUsersFirstChat(userId: string) {
  const q = query(
    collection(db, CONSTANTS.chats),
    where(CONSTANTS.userId, '==', userId),
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


export const useFiles = () => {
  const filesQuery = query(collection(db, CONSTANTS.files));
  const [filesSnapshot, loading, error] = useCollection(filesQuery);

  const files = filesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) || [];

  return { files, loading, error };
}

