import * as Constants from 'shared/src/constants';
import dbAdmin from 'shared/src/firebaseAdmin';
import admin from 'firebase-admin';
import { MessageWrite, MessagePinecone } from 'shared/src/typings';


export const updateChat = async (chatId: string, aiMessageContent: string, userMessageId: string, topic: string, newTurnState: number): Promise<MessagePinecone> => {
    try {
        const batch = dbAdmin.batch();
        const chatRef = dbAdmin.collection(Constants.chats).doc(chatId);

        // Update turnState
        batch.update(chatRef, { turnState: newTurnState });

        // Add the message
        const messageDocRef = chatRef.collection(Constants.messages).doc();
        const messageWrite: MessageWrite = { userId: Constants.ChatGPT, content: aiMessageContent, tags: [Constants.test]};
        batch.set(messageDocRef, {
            ...messageWrite,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Add the topic
        const topicDocRef = chatRef.collection(Constants.topics).doc();
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





