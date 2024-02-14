"use server";
import query from "./query";
import { addMessageAndUpdateTurnState } from "./firestoreHelpersServer";
import { MessagePinecone } from "shared/src/flow_0/typings";
import { upsertVectors } from "./pineconeHelpers";

interface SendPromptResponse {
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
        const action = response?.action || "";
        const aiMessage = await addMessageAndUpdateTurnState(chatId, content, 1);
        /*
            * turnState should be updated based on the action
            * several query methods could be called here
            * both human and AI messages should be upserted to Pinecone
        */
        await upsertVectors(chatId, userMessage, aiMessage); //ATTENTION: do I want to await this?
        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}

