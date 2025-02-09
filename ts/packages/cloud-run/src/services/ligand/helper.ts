import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

const urlLocal = `http://localhost:8123`;
const urlRemote = `https://ligandtest-50604cc56b085fd49885ad5d14c15452.us.langgraph.app`
const url = urlRemote; //process.env.URL || urlLocal;
const graphName = 'graph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });


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


