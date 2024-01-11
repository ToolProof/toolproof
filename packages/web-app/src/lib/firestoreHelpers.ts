import dbAdmin from "shared/firebaseAdmin";
import admin from "firebase-admin";
import { MessageWrite } from "shared/typings";

export const updateTurnState = async (conversationId: string, code: number): Promise<void> => {
    try {
        const conversationRef = dbAdmin.collection("conversations").doc(conversationId);
        await conversationRef.update({ turnState: code });
    } catch (error) {
        console.error("Failed to update turnState:", error);
        throw new Error("An error occurred while updating turnState");
    }
};

export const sendMessageToFirestore = async (content: string, conversationId: string): Promise<void> => {
    try {
        const message: MessageWrite = { userId: "ChatGPT", content };
        await dbAdmin.collection("conversations").doc(conversationId).collection("messages").add(
            {
                ...message,
                timestamp: admin.firestore.Timestamp.now(),
            }
        ); //ATTENTION_
    } catch (error) {
        console.error("Failed to send message to Firestore:", error);
        throw new Error("An error occurred while sending message to Firestore");
    }
};