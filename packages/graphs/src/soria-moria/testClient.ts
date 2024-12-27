import dotenv from "dotenv";
dotenv.config();

import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";

// Use the local API URL
const url = `http://localhost:8123`;
const graphName = "test";
const client = new Client({
    apiUrl: url, // Local API URL
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

(async () => {
    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();

        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [{ role: "user", content: "" }],
            },
            config
        );

        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);

        console.log("Result:", result);
    } catch (error) {
        console.error("Error invoking graph:", error);
    }
})();
