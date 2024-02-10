"use server";
import query from "./query";
import { addMessageAndUpdateTurnState } from "./firestoreHelpersServer";

interface SendPromptResponse {
  action: string;
}

export default async function sendPrompt({ path, prompt, user }: { path: string, prompt: string; user: string }): Promise<SendPromptResponse> {
    if (!prompt) {
        throw new Error("Prompt is required");
    }
    if (!path) {
        throw new Error("Conversation ID is required");
    }
    
    try {
        const response = await query({ conversationPath: path, prompt, user });
        const content = response?.modelResponse || "ChatGPT was unable to respond!";
        const action = response?.action || "";
        await addMessageAndUpdateTurnState(path, content, 1);
        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}
