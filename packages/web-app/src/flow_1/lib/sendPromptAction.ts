"use server";
import query from "./query";
import { updateChat } from "./firestoreHelpersServer";
import { MessagePinecone } from "shared/src/flow_0/typings";
import { upsertVectors } from "./pineconeHelpers";

interface SendPromptResponse {
    topicDetected: string;
    action: string;
}

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage: MessagePinecone }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error("Prompt is required");
    }
    if (!chatId) {
        throw new Error("Chat ID is required");
    }

    try {
        const response = await query({ chatId: chatId, promptSeed, userName: userName });

        const content = response?.modelResponse || "ChatGPT was unable to respond!";
        const topicDetected = response?.topicDetected || "default-topic";
        const action = response?.action || "";

        const aiMessage = await updateChat(chatId, content, userMessage.id, topicDetected, 1); //ATTENTION: turnState should be decided by the AI
        
        await upsertVectors(chatId, userMessage, aiMessage); //ATTENTION: do I want to await this?

        return { topicDetected, action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}

