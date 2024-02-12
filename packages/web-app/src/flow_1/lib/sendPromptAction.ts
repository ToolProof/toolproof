"use server";
import query from "./query";
import { addMessageAndUpdateTurnState } from "./firestoreHelpersServer";

interface SendPromptResponse {
  action: string;
}

export default async function sendPromptAction({ chatId, promptSeed, userName: userName }: { chatId: string, promptSeed: string; userName: string }): Promise<SendPromptResponse> {
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
        await addMessageAndUpdateTurnState(chatId, content, 1);
        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}
