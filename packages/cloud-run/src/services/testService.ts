import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';
import { Request, Response } from 'express';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://postgrestest-8035ddbf77dd5839843bf1093dfaed79.us.langgraph.app`
const url = urlRemote; //process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });


// ATTENTION: must ensure idempotency

export default async function testHandler(req: Request, res: Response) {

    try {

        await testHelper();

        // Send a success response to Pub/Sub
        res.status(200).send('Task completed successfully');
    } catch (error) {
        console.error('Error invoking graph:', error);
        // Send a failure response to Pub/Sub
        res.status(500).send('Task failed');
    }

}


export async function testHelper() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: "cd8f8f15-abb9-4312-bec1-aa6fbfa3718f" } };
        // const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Have you heard about my achievements?')],
            },
            config,
        );

        console.log('threadId:', thread.thread_id);
        console.log('result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
