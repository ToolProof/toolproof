'use server';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { BaseMessageWithType } from 'shared/src/typings';


const url = `https://baztest-490f0752e1d2559197a721cafbd3a375.us.langgraph.app`;
const apiKey = process.env.NEXT_PUBLIC_LANGCHAIN_API_KEY;
const ligandGraph = new RemoteGraph({
    graphId: 'graph',
    url,
    apiKey
});

// invoke the graph with the thread config
const config = { configurable: { thread_id: '5426f0ae-0abf-41ac-865b-6b1c7abf9056' } };

export default async function sendPromptAction({ threadId, prompt }: { threadId: string, prompt: string; }) {
    if (!threadId) {
        throw new Error('threadId is required');
    }
    if (!prompt) {
        throw new Error('prompt is required');
    }

    try {

        console.log('prompt:', prompt);

        const result = await ligandGraph.invoke({
            messages: [{ role: 'user', content: prompt }],
        }, config);

        const messages: BaseMessageWithType[] = result.messages; // TODO: must be type-validated

        return messages;
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

