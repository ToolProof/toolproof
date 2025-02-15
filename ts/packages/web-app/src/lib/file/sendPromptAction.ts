'use server';
import dotenv from 'dotenv';
dotenv.config();

import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
// import { MessageRead } from 'shared/src/typings';
// import { updateChat, uploadFileToStorage } from '../firebaseAdminHelpers';
import { upsertVectors } from '../pineconeHelpers';

import fs from 'fs';
import path from 'path';

interface SendPromptResponse {
    modelResponse: string;
}

const url = `http://localhost:8123`;
const client = new Client({
    apiUrl: url,
});

const test = new RemoteGraph({ graphId: 'fooGraph', url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage?: string }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }
    if (!userMessage)
        throw new Error('User message is required');
    try {

        const result = await test.invoke({
            messages: [{ role: 'user', content: `${promptSeed}. Vocabulary list: bus, horse, cooler, wig, apprentice` }],
        }, config);

        const messagesLength = result.messages.length;

        const usageMetadata = result.messages[messagesLength - 1].usage_metadata;

        // console.log('Usage metadata:', JSON.stringify(usageMetadata));

        const aiMessageContent = result.messages[messagesLength - 1].content;

        // const aiMessage = await updateChat(chatId, aiMessageContent, userMessage, 1); // ATTENTION: turnState should be decided by the AI

        // upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        // How do I save aiMessageContent to an .md file and upload the file to GCP Cloud Storage?

        // Determine the appropriate directory for temporary files
        /* const isVercel = process.env.VERCEL === '1' && false;
        const tempDir = isVercel ? '/tmp' : path.join(process.env.TEMP || 'C:\\temp');

        // Ensure the directory exists in development
        if (!isVercel && !fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Step 1: Save aiMessageContent to a .md file
        const fileName = `${chatId}.md`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, aiMessageContent);

        // Step 2: Upload the file to GCP Cloud Storage
        await uploadFileToStorage(filePath, fileName);
        
        console.log('File uploaded to GCP Cloud Storage:', fileName); */

        return { modelResponse: aiMessageContent };
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

