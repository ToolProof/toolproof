import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://baztest-490f0752e1d2559197a721cafbd3a375.us.langgraph.app`;
const url = urlLocal; //process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });


export async function runRemoteGraph() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        // const config = { configurable: { thread_id: "5426f0ae-0abf-41ac-865b-6b1c7abf9056" } };
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Graph is invoked')]
            },
            config,
        );

        console.log('threadId:', thread.thread_id);
        console.log('result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
