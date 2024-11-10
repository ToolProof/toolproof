'use server';
import chainOrchestrator from './chains/chainOrchestrator';
import { updateChat } from './firebaseAdminHelpers';
import { MessageRead } from 'shared/src/typings';
import { upsertVectors } from './pineconeHelpers';

interface SendPromptResponse {
    modelResponse: string;
}

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage: Omit<MessageRead, 'timestamp'> }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }

    try {

        const foo = await chainOrchestrator({ chatId, promptSeed, userName });

        const aiMessageContent = foo.modelResponse;

        const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, 1); // ATTENTION: turnState should be decided by the AI

        upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        return foo;
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

