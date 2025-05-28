'use server';
import dotenv from 'dotenv';
dotenv.config();
import { url } from './url';
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';


const graphId = 'ligandokreado';
const client = new Client({
    apiUrl: url,
    apiKey: process.env.LANGCHAIN_API_KEY,
});
const remoteGraph = new RemoteGraph({
    graphId,
    url,
    apiKey: process.env.LANGCHAIN_API_KEY,
});


export async function runLigandokreado() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800000); // 30 minutes

        const bucketName = 'tp_resources';

        try {
            // console.log('Invoking the graph')
            const result = await remoteGraph.invoke({
                messages: [new HumanMessage('Graph is invoked')],
                dryModeManager: {
                    dryRunMode: false,
                    delay: 3000,
                    drySocketMode: false,
                },
                resourceMap: {
                    anchor: {
                        path: `https://storage.googleapis.com/${bucketName}/ligandokreado/1iep/2025-01-01T00:00:00.000Z/candidate.smi`,
                        intraMorphism: 'doNothing',
                        value: null,
                    },
                    target: {
                        path: `https://storage.googleapis.com/${bucketName}/ligandokreado/1iep/target.pdb`,
                        intraMorphism: 'chunkPDBContent',
                        value: null,
                    },
                    box: {
                        path: `https://storage.googleapis.com/${bucketName}/ligandokreado/1iep/box.pdb`,
                        intraMorphism: 'chunkPDBContent',
                        value: null,
                    },
                },
            }, {
                configurable: { thread_id: thread.thread_id },
                signal: controller.signal,
            });

            // console.log('threadId:', thread.thread_id);
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
