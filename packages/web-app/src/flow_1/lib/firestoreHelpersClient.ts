import { db } from "shared/src/flow_0/firebaseClient";
import { doc, getDocs, setDoc, addDoc, deleteDoc, serverTimestamp, collection, query, where, orderBy, limit } from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { ChatWrite, MessageWrite, ChatRead, MessageRead } from "shared/src/flow_0/typings";
import * as Constants from "shared/src/flow_0/constants";


export const addGenesisChat = async (chatWrite: ChatWrite) => {
  try {
    const docRef = doc(collection(db, Constants.CHATS));
    const newPath = `${Constants.CHATS}/${docRef.id}`;
    chatWrite.path = newPath;
    await setDoc(docRef,
      {
        ...chatWrite,
        timestamp: serverTimestamp(),
      });
    console.log("Document added successfully with path:", chatWrite.path);
    return { id: docRef.id, path: newPath }
  } catch (error) {
    console.error("Error adding document: ", error);
    return "";
  }
};


export const addChildChat = async (parentPath: string, chatWrite: ChatWrite) => {
  try {
    const docRef = doc(collection(db, parentPath, Constants.CHATS));
    const newPath = `${parentPath}/${Constants.CHATS}/${docRef.id}`;
    chatWrite.path = newPath;
    await setDoc(docRef,
      {
        ...chatWrite,
        timestamp: serverTimestamp(),
      });
    console.log("Document added successfully with path:", chatWrite.path);
    return { id: docRef.id, path: newPath }
  } catch (error) {
    console.error("Error adding document: ", error);
    return "";
  }
};


export async function deleteChat(path: string) {
  try {
    const chatRef = doc(db, path);
    await deleteDoc(chatRef);
    return { data: "ok" };
  } catch (err) {
    return { error: err };
  }
}


export const addMessage = async (path: string, messageWrite: MessageWrite) => {
  try {
    await addDoc(collection(db, path, Constants.MESSAGES),
      {
        ...messageWrite,
        timestamp: serverTimestamp(),
      });
    console.log("Document added successfully");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}


export const useGenesisChats = (userEmail: string) => {
  const [value, loading, error] = useCollection(
    query(collection(db, Constants.CHATS), where(Constants.USERID, "==", userEmail), orderBy(Constants.TIMESTAMP))
  );

  const chats = value?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    idPath: replaceSlashWithTilde(doc.data().path),
  } as ChatRead)) || [];

  return { chats, loading, error };
};


export const useChildChats = (path: string) => {
  const [value, loading, error] = useCollection(
    query(collection(db, path, Constants.CHATS), orderBy(Constants.TIMESTAMP))
  );

  const chats = value?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    idPath: replaceSlashWithTilde(doc.data().path),
  } as ChatRead)) || [];

  return { chats, loading, error };
};


export function useChat(path: string) {
  const chatRef = doc(db, path);
  const [chatSnapshot, loading, error] = useDocument(chatRef);

  const chat = chatSnapshot?.exists()
    ? {
      ...chatSnapshot.data(),
      id: chatSnapshot.id,
      idPath: replaceSlashWithTilde(path)
    } as ChatRead
    : null;

  return { chat, loading, error };
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


export async function userChatsIsEmpty(userId: string) {
  const q = query(
      collection(db, Constants.CHATS),
      where(Constants.USERID, "==", userId),
      orderBy(Constants.TIMESTAMP, Constants.ASC),
      limit(1)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}


export function replaceSlashWithTilde(input: string) {
  return input.replace(/\//g, "~");
}


export function replaceTildeWithSlash(input: string) {
  return input.replace(/~/g, "/");
}



