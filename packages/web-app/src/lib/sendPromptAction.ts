'use server';
import chainOrchestrator from './chains/chainOrchestrator';
import { updateConcept } from './firestoreHelpersServer';
import { MessageReadWithoutTimestamp } from 'shared/src/typings';
import { upsertVectors } from './pineconeHelpers';

interface SendPromptResponse {
    topicDetected: string;
    action: string;
}

export default async function sendPromptAction({ conceptId, promptSeed, userName, userMessage }: { conceptId: string, promptSeed: string; userName: string, userMessage: MessageReadWithoutTimestamp }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!conceptId) {
        throw new Error('Concept ID is required');
    }

    try {

        upsertVectors(conceptId, [userMessage]); // ATTENTION: do we need to await this?

        return { topicDetected: 'topicDetected', action: 'action' };

        /* const foo = await chainOrchestrator({ conceptId, promptSeed, userName });

        const aiMessageContent = foo.modelResponse;
        const topicDetected = foo.topicDetected;
        const action = foo.action;

        const aiMessage = await updateConcept(conceptId, aiMessageContent, userMessage.id, topicDetected, 1); // ATTENTION: turnState should be decided by the AI
        
        upsertVectors(conceptId, userMessage, aiMessage); // ATTENTION: do I want to await this?

        return { topicDetected, action }; */
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }
    
}

