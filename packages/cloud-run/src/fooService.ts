import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';
import fs from 'fs';
import path from 'path';
import { uploadFileToStorage, uploadFileNameToFirestore } from './firebaseAdminHelpers.js';
import { Request, Response } from 'express';

const urlLocal = `http://localhost:8123`;
const url = process.env.URL || urlLocal;
const graphName = 'fooGraph';
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// ATTENTION: must ensure idempotency

export default async function fooHandler(req: Request, res: Response) {

    try {

        await fooHelper(false);

        // Send a success response to Pub/Sub
        res.status(200).send('Task completed successfully');
    } catch (error) {
        console.error('Error invoking graph:', error);
        // Send a failure response to Pub/Sub
        res.status(500).send('Task failed');
    }

}


export async function fooHelper(isWindows: boolean) {

    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Gold is not a scarce resource because there is a lot of it in the ocean.')],
            },
        );

        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);

        // console.log('Result:', result);


        // Determine the temporary directory based on the platform
        const tmpDir = isWindows ? path.join(process.env.TEMP || 'C:\\temp') : '/tmp';

        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const now = new Date();
        const fileName = `${now.toISOString().replace(/:/g, '-')}.md`;
        const filePath = path.join(tmpDir, fileName);

        fs.writeFileSync(filePath,
            JSON.stringify(result.messages[0].content, null, 2) +
            '\n\n\n' +
            JSON.stringify(result.messages[1].content, null, 2) +
            '\n\n\n' +
            JSON.stringify(result.messages[2].content, null, 2)
        );

        // Upload the file to GCP Cloud Storage
        await uploadFileToStorage(filePath, fileName);

        // Upload the file name to Firestore
        await uploadFileNameToFirestore(fileName);

        console.log('messages.length:', result.messages.length);
    } catch (error) {
        console.error('Error invoking graph:', error);
    }

}
