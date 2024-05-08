import * as CONSTANTS from 'shared/src/constants';
import { ConceptWrite, MessageWrite, ConceptRead, MessageRead, MessageReadWithoutTimestamp } from 'shared/src/typings';
import { db } from 'shared/src/firebaseClient';
import { doc, addDoc, getDocs, deleteDoc, serverTimestamp, collection, query, orderBy, where, limit } from 'firebase/firestore';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';


export const addConcept = async (conceptWrite: ConceptWrite) => {
  try {
    const docRef = await addDoc(collection(db, CONSTANTS.concepts), {
      ...conceptWrite,
      [CONSTANTS.timestamp]: serverTimestamp(),
    });
    return { conceptId: docRef.id };
  } catch(e) {
    console.error(e);
  }
}


export const deleteConcept = async (conceptId: string) => {
  try {
    console.log('Deleting concept with ID:', conceptId);
    await deleteDoc(doc(db, CONSTANTS.concepts, conceptId));
  } catch(e) {
    console.error(e);
  }
}


export const addMessage = async (conceptId: string, messageWrite: MessageWrite): Promise<MessageReadWithoutTimestamp> => {
  try {
    const docRef = await addDoc(collection(db, CONSTANTS.concepts, conceptId, CONSTANTS.messages), {
      ...messageWrite,
      [CONSTANTS.timestamp]: serverTimestamp(),
    });
    return { id: docRef.id, ...messageWrite };
  } catch(e) {
    console.error(e);
    throw new Error('An error occurred while adding message');
  }
}


export function useConcepts(userId: string) {
  const conceptsQuery = query(collection(db, CONSTANTS.concepts), where(CONSTANTS.userId, '==', userId), limit(10));
  const [conceptsSnapshot, loading, error] = useCollection(conceptsQuery);

  const concepts = conceptsSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as ConceptRead[] || [];

  return { concepts, loading, error };
}


export function useConcept(conceptId: string) { // ATTENTION: be consistent with function syntax
  const conceptRef = doc(db, CONSTANTS.concepts, conceptId);
  const [conceptSnapshot, loading, error] = useDocument(conceptRef);

  const concept = conceptSnapshot?.exists()
    ? {
      ...conceptSnapshot.data(),
      id: conceptSnapshot.id,
    } as ConceptRead
    : null;

  return { concept, loading, error };
}


export const useMessages = (conceptId: string) => {
  const messagesQuery = query(collection(db, CONSTANTS.concepts, conceptId, CONSTANTS.messages), orderBy(CONSTANTS.timestamp, CONSTANTS.asc));
  const [messagesSnapshot, loading, error] = useCollection(messagesQuery);

  const messages = messagesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as MessageRead[] || [];

  return { messages, loading, error };
}


export async function getIdOfUsersFirstConcept(userId: string) {
  const q = query(
    collection(db, CONSTANTS.concepts),
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
