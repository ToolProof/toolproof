'use server';
import { MessageRead } from 'shared/src/typings';
import { updateChat } from '@/lib/firebaseAdminHelpers';
// import { upsertVectors } from '@/lib/pineconeHelpers';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';


function readVocabularyFile(): Promise<string> {
    const filePath = path.join(process.cwd(), 'src/lib/chat/ligament/vocabulary.txt');
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject('Error reading vocabulary.txt: ' + err);
                return;
            }
            resolve(data);
        });
    });
}

const url = `http://localhost:8123`;
const client = new Client({
    apiUrl: url,
});

const ligamentGraph = new RemoteGraph({ graphId: 'graph', url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ chatId, prompt, userName, userMessage }: { chatId: string, prompt: string; userName: string, userMessage: Omit<MessageRead, 'timestamp'> }) {
    if (!prompt) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }

    try {

        const vocabulary = await readVocabularyFile();

        const result = await ligamentGraph.invoke({ // ATTENTION: could use HumanMessage
            messages: [{ role: 'user', content: `${prompt}. Vocabulary: ${vocabulary}` }],
        }, config);

        const messagesLength = result.messages.length;

        /* const usageMetadata = result.messages[messagesLength - 1].usage_metadata;
        console.log('Usage metadata:', JSON.stringify(usageMetadata)); */

        const aiMessageContent: string = result.messages[messagesLength - 1].content; // ATTENTION: validate with zod

        const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, 1);

        // upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        return { aiMessageContent: aiMessageContent };
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

