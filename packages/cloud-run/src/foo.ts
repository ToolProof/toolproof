import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";

const url = `https://soria-moria-7d184b0bf5fe520bac52d32d73931339.default.us.langgraph.app`;
const graphName = "test";
const client = new Client({
    apiUrl: url,
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
