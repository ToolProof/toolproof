'use server';
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';


const url = `https://ligand-3366aaf1e09b5cf885f48533ba2ae831.us.langgraph.app`;
const client = new Client({
    apiUrl: url,
});

const ligandGraph = new RemoteGraph({ graphId: 'graph', url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ threadId, prompt }: { threadId: string, prompt: string; }) {
    if (!threadId) {
        throw new Error('threadId is required');
    }
    if (!prompt) {
        throw new Error('prompt is required');
    }

    try {

        // ligandGraph.getStateHistory(config);

        const result = await ligandGraph.invoke({
            messages: [new HumanMessage(prompt)],
        }, config);

        const messages: BaseMessage[] = result.messages; // TODO: must be type-validated

        return messages;
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

