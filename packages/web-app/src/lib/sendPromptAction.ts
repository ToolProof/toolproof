"use server";
import query from "./query";
import { addMessageAndUpdateTurnState } from "./firestoreHelper";

interface SendPromptResponse {
  action: string;
}

export default async function sendPrompt({ conversationId, prompt, user }: { conversationId: string; prompt: string; user: string }): Promise<SendPromptResponse> {
    if (!prompt) {
        throw new Error("Prompt is required");
    }
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    try {
        const response = await query({ conversationId, prompt, user });
        const content = response?.modelResponse || "ChatGPT was unable to respond!";
        const action = response?.action || "";
        await addMessageAndUpdateTurnState(conversationId, content, 1);
        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}
