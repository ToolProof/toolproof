import * as Constants from 'shared/src/constants';
// import dbAdmin from 'shared/src/firebaseAdminInit';
// import admin from 'firebase-admin';
import { Storage, UploadResponse } from '@google-cloud/storage';


/* export const updateChat = async (chatId: string, aiMessageContent: string, userMessageId: string, newTurnState: number): Promise<Omit<MessageRead, 'timestamp'>> => {
    try {
        const batch = dbAdmin.batch();
        const chatRef = dbAdmin.collection(Constants.chats).doc(chatId);

        // Update turnState
        batch.update(chatRef, { turnState: newTurnState });

        // Add the message
        const messageDocRef = chatRef.collection(Constants.messages).doc();
        const messageWrite: MessageWrite = { userId: Constants.ChatGPT, content: aiMessageContent, isMeta: false, tags: [Constants.test] };
        batch.set(messageDocRef, {
            ...messageWrite,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Commit the batch
        await batch.commit();
        return { id: messageDocRef.id, ...messageWrite };
    } catch (error) {
        console.error('Failed to execute batch operation:', error);
        throw new Error('An error occurred while executing batch operation');
    }
}; */



export const uploadFileToStorage = (localFilePath: string, remoteFilePath: string): Promise<UploadResponse> => {

    const storage = new Storage();

    return storage.bucket('toolproof-yellowpapers').upload(localFilePath, { destination: remoteFilePath });
};





