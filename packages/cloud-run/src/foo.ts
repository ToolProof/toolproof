import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";
import fs from 'fs';
import path from 'path';
import { uploadFileToStorage, uploadFileNameToFirestore } from './firebaseAdminHelpers';
import { Request, Response } from 'express';

const url = `https://soria-moria-7d184b0bf5fe520bac52d32d73931339.default.us.langgraph.app`;
const graphName = "test";
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// ATTENTION: must ensure idempotency

export default async function fooHandler(req: Request, res: Response) {
    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [{ role: "user", content: "" }],
            },
        );

        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);

        // console.log("Result:", result);


        // Ensure the directory exists
        if (!fs.existsSync('/tmp')) {
            fs.mkdirSync('/tmp', { recursive: true });
        }

        // Save result to a .md file
        const now = new Date();
        const fileName = `${now.toISOString()}.md`;
        const filePath = path.join('/tmp', fileName);
        fs.writeFileSync(filePath, JSON.stringify(result.messages[1].content, null, 2));

        // Upload the file to GCP Cloud Storage
        await uploadFileToStorage(filePath, fileName);

        // Upload the file name to Firestore
        await uploadFileNameToFirestore(fileName);

        // Send a success response to Pub/Sub
        res.status(200).send("Task completed successfully");
    } catch (error) {
        console.error("Error invoking graph:", error);
        // Send a failure response to Pub/Sub
        res.status(500).send("Task failed");
    }
    
}
