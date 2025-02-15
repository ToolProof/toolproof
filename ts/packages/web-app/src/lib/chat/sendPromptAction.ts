'use server';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { BaseMessageWithType } from 'shared/src/typings';


const url = `http://localhost:8123`;
const ligandGraph = new RemoteGraph({ graphId: 'graph', url });

// invoke the graph with the thread config
const config = { configurable: { thread_id: 'a3be082e-59c5-4070-85af-c30093f71ce4' } };

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

