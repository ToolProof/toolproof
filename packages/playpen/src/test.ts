import dotenv from "dotenv";
dotenv.config();

import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";


const url = `https://devils-advocate-7b5597e2a7f45cb09ae9859794109061.default.us.langgraph.app`;
const graphName = "agent";
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id }};
const result = await remoteGraph.invoke({
  messages: [{ role: "user", content: "What's the weather in KL?" }],
}, config);

// verify that the state was persisted to the thread
/* const threadState = await remoteGraph.getState(config);
console.log(threadState); */

console.log(result);