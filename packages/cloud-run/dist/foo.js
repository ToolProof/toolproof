"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fooHandler;
const langgraph_sdk_1 = require("@langchain/langgraph-sdk");
const remote_1 = require("@langchain/langgraph/remote");
const url = `https://soria-moria-7d184b0bf5fe520bac52d32d73931339.default.us.langgraph.app`;
const graphName = "test";
const client = new langgraph_sdk_1.Client({
    apiUrl: url,
});
const remoteGraph = new remote_1.RemoteGraph({ graphId: graphName, url });
async function fooHandler() {
    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();
        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke({
            messages: [{ role: "user", content: "" }],
        });
        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);
        console.log("Result:", result);
    }
    catch (error) {
        console.error("Error invoking graph:", error);
    }
}
