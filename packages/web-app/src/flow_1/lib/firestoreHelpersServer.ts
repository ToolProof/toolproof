import * as Constants from "shared/src/flow_0/constants";
import dbAdmin from "shared/src/flow_0/firebaseAdmin";
import admin from "firebase-admin";
import { MessageWrite, MessagePinecone } from "shared/src/flow_0/typings";


export const addMessageAndUpdateTurnState = async (chatId: string, content: string, code: number): Promise<MessagePinecone> => {
    try {
        const batch = dbAdmin.batch();
        const chatRef = dbAdmin.collection(Constants.CHATS).doc(chatId);

        // Update turnState
        batch.update(chatRef, { turnState: code });

        // Send message to Firestore
        const docRef = chatRef.collection(Constants.MESSAGES).doc();
        const messageWrite: MessageWrite = { userId: Constants.ChatGPT, content, tags: [Constants.TEST]};
        batch.set(docRef, {
            ...messageWrite,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Commit the batch
        await batch.commit();
        return { id: docRef.id, ...messageWrite };
    } catch (error) {
        console.error("Failed to execute batch operation:", error);
        throw new Error("An error occurred while executing batch operation");
    }
};





