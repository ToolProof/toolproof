import dotenv from 'dotenv';
dotenv.config();

import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';

const url = `https://european-pals-2c35c0cc124551a6894f8a02afc3522b.default.us.langgraph.app`;
const client = new Client({
    apiUrl: url,
});

const spanishPal = new RemoteGraph({ graphId: 'spanishPal', url });
const swedishPal = new RemoteGraph({ graphId: 'swedishPal', url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage: Omit<MessageRead, 'timestamp'> }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }

    try {

        let result;

        if (promptSeed.includes('?')) {
            result = await spanishPal.invoke({
                messages: [{ role: 'user', content: promptSeed }],
            }, config);
        } else {
            result = await swedishPal.invoke({
                messages: [{ role: 'user', content: promptSeed }],
            }, config);
        }

        // console.log(result);

        const messagesLength = result.messages.length;

        const usageMetadata = result.messages[messagesLength - 1].usage_metadata;

        console.log('Usage metadata:', JSON.stringify(usageMetadata));

        const aiMessageContent = result.messages[messagesLength - 1].content;

        const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, 1); // ATTENTION: turnState should be decided by the AI

        upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        return { modelResponse: aiMessageContent };
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

