import * as Constants from "shared/constants";
import dbAdmin from "shared/firebaseAdmin";
import admin from "firebase-admin";
import { MessageWrite } from "shared/typings";


export const addGenesisMessageAndUpdateTurnState = async (conversationId: string, content: string, code: number): Promise<void> => {
    try {
        const batch = dbAdmin.batch();
        const conversationRef = dbAdmin.collection(Constants.conversations).doc(conversationId);

        // Update turnState
        batch.update(conversationRef, { turnState: code });

        // Send message to Firestore
        const messageRef = conversationRef.collection(Constants.messages).doc();
        const message: MessageWrite = { userId: "ChatGPT", content };
        batch.set(messageRef, {
            ...message,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Commit the batch
        await batch.commit();
    } catch (error) {
        console.error("Failed to execute batch operation:", error);
        throw new Error("An error occurred while executing batch operation");
    }
};


export const addChildMessageAndUpdateTurnState = async (conversationId: string, genesisConversationId: string, content: string, code: number): Promise<void> => {
    try {
        const batch = dbAdmin.batch();
        const conversationRef = dbAdmin.collection(Constants.conversations).doc(genesisConversationId).collection(Constants.conversations).doc(conversationId);

        // Update turnState
        batch.update(conversationRef, { turnState: code });

        // Send message to Firestore
        const messageRef = conversationRef.collection(Constants.messages).doc();
        const message: MessageWrite = { userId: "ChatGPT", content };
        batch.set(messageRef, {
            ...message,
            timestamp: admin.firestore.Timestamp.now(),
        });

        // Commit the batch
        await batch.commit();
    } catch (error) {
        console.error("Failed to execute batch operation:", error);
        throw new Error("An error occurred while executing batch operation");
    }
};




