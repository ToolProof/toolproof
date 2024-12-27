'use server';
import dotenv from 'dotenv';
dotenv.config();

import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';

import { MessageRead } from 'shared/src/typings';
import { updateChat } from './firebaseAdminHelpers';
import { upsertVectors } from './pineconeHelpers';

interface SendPromptResponse {
    modelResponse: string;
}

const url = `https://soria-moria-7d184b0bf5fe520bac52d32d73931339.default.us.langgraph.app`;
const client = new Client({
    apiUrl: url,
});

const test = new RemoteGraph({ graphId: 'test', url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage?: Omit<MessageRead, 'timestamp'> }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }

    try {

        const result = await test.invoke({
            messages: [{ role: 'user', content: '' }],
        }, config);

        const messagesLength = result.messages.length;

        const usageMetadata = result.messages[messagesLength - 1].usage_metadata;

        console.log('Usage metadata:', JSON.stringify(usageMetadata));

        const aiMessageContent = result.messages[messagesLength - 1].content;

        // const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, 1); // ATTENTION: turnState should be decided by the AI

        // upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        // How do I save aiMessageContent to an .md file and upload the file to GCP Cloud Storage?

        return { modelResponse: aiMessageContent };
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

