import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

// Make sure to use the correct graph name as defined in langgraph.json
const url = `http://localhost:2024`;  
const graphName = 'storage_graph';    // This matches the name in langgraph.json

const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

async function main() {
    try {
        // Create a thread
        const thread = await client.threads.create();
        console.log('Created thread:', thread.thread_id);

        // Invoke the storage_graph specifically
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Tell me about the capital of Sweden')],
            },
            config
        );

        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();



