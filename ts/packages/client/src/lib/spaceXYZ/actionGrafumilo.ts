'use server';
import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://deployment-typescript-48b9b40b9bac500f8fe557700e4c49d9.us.langgraph.app`;
const url = urlRemote; //process.env.URL || urlLocal;
const graphId = 'grafumilo';
const client = new Client({
    apiUrl: url,
    apiKey: process.env.LANGCHAIN_API_KEY,
});
const remoteGraph = new RemoteGraph({
    graphId,
    url,
    apiKey: process.env.LANGCHAIN_API_KEY,
});


export async function runGrafumilo(path: string) {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800000); // 30 minutes

        try {
            // console.log('Invoking the graph')
            const result = await remoteGraph.invoke({
                messages: [new HumanMessage('Graph is invoked')],
                path: path,
            });

            console.log('threadId:', thread.thread_id);
            // console.log('result:', JSON.stringify(result, null, 2));
            return result;

        } finally {
            clearTimeout(timeout);
            if (!controller.signal.aborted) {
                controller.abort();
            }
        }

    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
