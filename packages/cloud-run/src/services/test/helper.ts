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
        const config = { configurable: { thread_id: "cd8f8f15-abb9-4312-bec1-aa6fbfa3718f" } };
        // const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('What is the official currency in Uganda?')],
            },
            config,
        );

        // console.log('threadId:', thread.thread_id);
        console.log('result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
