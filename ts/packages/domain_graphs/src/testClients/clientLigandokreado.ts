import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://deployment-typescript-48b9b40b9bac500f8fe557700e4c49d9.us.langgraph.app`;
const url = urlLocal; //process.env.URL || urlLocal;
const graphId = 'ligandokreado';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId, url });


export async function runRemoteGraph() {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800000); // 30 minutes

        try {
            // console.log('Invoking the graph')
            const result = await remoteGraph.invoke({
                messages: [new HumanMessage('Graph is invoked')],
                dryModeManager: {
                    dryRunMode: false,
                    delay: 1000,
                    drySocketMode: true,
                },
                resourceMap: {
                    anchor: {
                        path: 'ligandokreado/1iep/2025-01-01T00:00:00.000Z/candidate.smi',
                        intraMorphism: 'doNothing',
                        value: null,
                    },
                    target: {
                        path: 'ligandokreado/1iep/target.pdb',
                        intraMorphism: 'chunkPDBContent',
                        value: null,
                    },
                    box: {
                        path: 'ligandokreado/1iep/box.pdb',
                        intraMorphism: 'chunkPDBContent',
                        value: null,
                    },
                },
            }, {
                configurable: { thread_id: thread.thread_id },
                signal: controller.signal,
            });

            // console.log('threadId:', thread.thread_id);
            console.log('result:', JSON.stringify(result.resourceMap.shouldRetry, null, 2));
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
