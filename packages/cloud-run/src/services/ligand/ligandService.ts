import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';
import fs from 'fs';
import path from 'path';
import { uploadFileToStorage, uploadFileNameToFirestore } from '../../firebaseAdminHelpers.js';
import { Request, Response } from 'express';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://postgrestest-8035ddbf77dd5839843bf1093dfaed79.us.langgraph.app`
const url = urlLocal; //process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// ATTENTION: must ensure idempotency

export default async function ligandHandler(req: Request, res: Response) {

    try {

        await ligandHelper();

        // Send a success response to Pub/Sub
        res.status(200).send('Task completed successfully');
    } catch (error) {
        console.error('Error invoking graph:', error);
        // Send a failure response to Pub/Sub
        res.status(500).send('Task failed');
    }

}


export async function ligandHelper() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Hi, how are you?')],
            },
        );

        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);

        const length = result.messages.length;

        console.log ('messages length: ', length);

        console.log('Result:', JSON.stringify(result.messages[length - 1], null, 2));


    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}


