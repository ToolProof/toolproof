import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const urlLocal = `http://localhost:8123`;
const urlRemote = ``
const url = urlLocal; //process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });


export async function testHelper() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: "ff090f1f-30bf-494b-a343-46d066bead3f" } };
        // const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('What is the capital of Sweden?')],
            },
            config,
        );

        // console.log('threadId:', thread.thread_id);
        console.log('result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
