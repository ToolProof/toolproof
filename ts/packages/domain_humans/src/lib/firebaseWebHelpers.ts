import * as CONSTANTS from 'shared/src/constants';
import * as TYPES from 'shared/src/typings';
import { ChatWrite, ChatRead } from 'shared/src/typings';
import { db } from '@/lib/firebaseWebInit';
import { doc, addDoc, deleteDoc, serverTimestamp, collection, query, where, limit } from 'firebase/firestore';
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


export const useProblem = (problemId: string) => {
  const parentDocRef = doc(db, 'data', 'MzqmiqTBo3QVYJmuN93o');
  const problemDocRef = doc(parentDocRef, 'problems', problemId);
  const [problemSnapshot, loading, error] = useDocument(problemDocRef);

  const problem = problemSnapshot?.exists()
    ? {
      ...problemSnapshot.data(),
      id: problemSnapshot.id,
    } as TYPES.Problem
    : null;

  return { problem, loading, error };

}


export const useProblems = () => {
  const parentDocRef = doc(db, 'data', 'MzqmiqTBo3QVYJmuN93o');
  const problemsQuery = query(collection(parentDocRef, 'problems'));
  const [problemsSnapshot, loading, error] = useCollection(problemsQuery);

  const problems = problemsSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as TYPES.Problem)) || [];

  return { problems, loading, error };
}


export const useResources = (problemId: string) => {
  const parentDocRef = doc(db, 'data', 'MzqmiqTBo3QVYJmuN93o');
  const resourcesQuery = query(collection(parentDocRef, 'resources'), where('problemIds', 'array-contains', problemId));
  const [resourcesSnapshot, loading, error] = useCollection(resourcesQuery);

  const resources = resourcesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as TYPES.Resource)) || [];

  return { resources, loading, error };
}


export const useTools = (problemId: string) => {
  const parentDocRef = doc(db, 'directors', '14LbMft0sPWKSpaGE1qa');
  const toolsQuery = query(collection(parentDocRef, 'tools'), where('problemIds', 'array-contains', problemId));
  const [toolsSnapshot, loading, error] = useCollection(toolsQuery);

  const tools = toolsSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  } as TYPES.Tool)) || [];

  return { tools, loading, error };
}

