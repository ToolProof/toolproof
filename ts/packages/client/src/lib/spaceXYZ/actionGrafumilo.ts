'use server';
import dotenv from 'dotenv';
dotenv.config();
import { url } from './url';
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';


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
                resourceMap: {
                    candidate: {
                        path: path,
                        value: null,
                    },
                },
                /* resourceMap: {
                    container: {
                        path: path,
                        value: null,
                    },
                }, */
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
