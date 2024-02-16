"use server";
import chainOrchestrator from "./chains/chainOrchestrator";
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
        const foo = await chainOrchestrator({ chatId, promptSeed, userName });

        const aiMessageContent = foo.modelResponse;
        const topicDetected = foo.topicDetected;
        const action = foo.action;

        const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, topicDetected, 1); //ATTENTION: turnState should be decided by the AI
        
        // upsertVectors(chatId, userMessage, aiMessage); //ATTENTION: do I want to await this?

        return { topicDetected, action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}

