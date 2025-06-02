import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const bucketName = 'tp_resources';
const urlLocal = `http://localhost:8123`;
const urlRemote = `https://deployment-typescript-48b9b40b9bac500f8fe557700e4c49d9.us.langgraph.app`;
const url = urlLocal; //process.env.URL || urlLocal;
const graphId = 'grafumilo';
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
                resourceMap: {
                    candidate: {
                        path: `https://storage.googleapis.com/${bucketName}/ligandokreado/1iep/`,
                        value: null,
                    },
                },
                /* resourceMap: {
                    container: {
                        path: 'https://raw.githubusercontent.com/ToolProof/toolproof/master/ts/packages/domain_graphs/src/graphs/ligandokreado.ts',
                        value: null,
                    },
                }, */
            });

            // console.log('threadId:', thread.thread_id);
            console.log('result:', JSON.stringify(result.resourceMap.candidate.value, null, 2));
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
