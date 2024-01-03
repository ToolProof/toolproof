import { addDoc, collection, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import { Session } from "next-auth";
import { ConversationWrite } from "shared/typings";


export const createConversationInFirestore = async (session: Session, parentId: string, y: number) => {
  try {
    const conversation = createConversationInMemory(session?.user?.email || "", serverTimestamp(), parentId, 0, y, -1);
    const docRef = await addDoc(collection(db, "conversations"), conversation); //ATTENTION_
    return docRef.id; // Return the ID of the new conversation
  } catch (error) {
    console.error("Error creating new conversation:", error);
    return null;
  }
};


const createConversationInMemory = (userId: string, timestamp: FieldValue, parentId: string, turnState: number, y: number, z: number) => {
  const conversation: ConversationWrite = {
    userId: userId,
    timestamp: timestamp,
    parentId: parentId,
    turnState: turnState,
    y: y,
    z: z,
  }
  return conversation;
}
