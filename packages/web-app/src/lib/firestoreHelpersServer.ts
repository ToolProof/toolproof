import * as Constants from 'shared/src/constants';
import dbAdmin from 'shared/src/firebaseAdmin';
import admin from 'firebase-admin';
import { MessageWrite, MessageReadWithoutTimestamp } from 'shared/src/typings';


export const updateConcept = async (conceptId: string, aiMessageContent: string, userMessageId: string, topic: string, newTurnState: number): Promise<MessageReadWithoutTimestamp> => {
    try {
        const batch = dbAdmin.batch();
        const conceptRef = dbAdmin.collection(Constants.concepts).doc(conceptId);

        // Update turnState
        batch.update(conceptRef, { turnState: newTurnState });

        // Add the message
        const messageDocRef = conceptRef.collection(Constants.messages).doc();
        const messageWrite: MessageWrite = { userId: Constants.ConceptGPT, content: aiMessageContent, tags: [Constants.test]};
        batch.set(messageDocRef, {
            ...messageWrite,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Add the topic
        const topicDocRef = conceptRef.collection(Constants.topics).doc();
        batch.set(topicDocRef, {
            topic,
            description: '',
            userMessageId: userMessageId,
        });

        // Commit the batch
        await batch.commit();
        return { id: messageDocRef.id, ...messageWrite };
    } catch (error) {
        console.error('Failed to execute batch operation:', error);
        throw new Error('An error occurred while executing batch operation');
    }
};





