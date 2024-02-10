"use server";
import query from "./query";
import { addMessageAndUpdateTurnState } from "./firestoreHelpersServer";

interface SendPromptResponse {
  action: string;
}

export default async function sendPromptAction({ conversationPath, promptSeed, userName: userName }: { conversationPath: string, promptSeed: string; userName: string }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error("Prompt is required");
    }
    if (!conversationPath) {
        throw new Error("Conversation ID is required");
    }
    
    try {
        const response = await query({ conversationPath: conversationPath, promptSeed, userName: userName });
        const content = response?.modelResponse || "ChatGPT was unable to respond!";
        const action = response?.action || "";
        await addMessageAndUpdateTurnState(conversationPath, content, 1);
        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}
