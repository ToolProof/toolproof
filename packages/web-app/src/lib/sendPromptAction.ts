"use server";
import query from "./query";
import { updateTurnState, sendMessageToFirestore } from "./firestoreHelpers";

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
        //await updateTurnState(conversationId, -1);
        const response = await query({ conversationId, prompt, user });
        const content = response?.modelResponse || "ChatGPT was unable to respond!";
        const action = response?.action || "";

        await sendMessageToFirestore(content, conversationId);
        await updateTurnState(conversationId, 1);

        return { action };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("An error occurred");
    }
}
