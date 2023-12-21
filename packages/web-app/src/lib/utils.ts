import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../setup/firebaseClient";
import { Session } from "next-auth";


export const createNewConversation = async (session: Session, parentId: string, y: number) => {
    try {
      const docRef = await addDoc(collection(db, "conversations"), {
        userId: session?.user?.email || "",
        timestamp: serverTimestamp(),
        parentId: parentId,
        turnState: 0,
        y: y,
        z: -1,
      });
      return docRef.id; // Return the ID of the new conversation
    } catch (error) {
      console.error("Error creating new conversation:", error);
      return null;
    }
  };
