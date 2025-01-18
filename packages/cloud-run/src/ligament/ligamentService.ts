import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';
import { Request, Response } from 'express';

const urlLocal = `http://localhost:8123`;
const url = process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });


// ATTENTION: must ensure idempotency

export default async function ligamentHandler(req: Request, res: Response) {

    try {

        await ligamentHelper();

        // Send a success response to Pub/Sub
        res.status(200).send('Task completed successfully');
    } catch (error) {
        console.error('Error invoking graph:', error);
        // Send a failure response to Pub/Sub
        res.status(500).send('Task failed');
    }

}


export async function ligamentHelper() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('reassurance')],
            },
        );

        console.log('result:', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
