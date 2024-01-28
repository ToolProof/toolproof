"use server";
import { addMessageAndUpdateTurnState } from "./firestoreHelper";

interface SendPromptResponse {
    action: string;
}

export default async function sendPrompt({ conversationId, prompt, user }: { conversationId: string; prompt: string; user: string }): Promise<SendPromptResponse> {
    const content = "Overall, the recursive setTimeout pattern provides a more controlled and predictable way to implement dynamic, time-based logic in React components, especially when it involves state updates and rendering.";
    await addMessageAndUpdateTurnState(conversationId, content, 1);
    return { action: "prompt" };
}