import dotenv from "dotenv";
dotenv.config();

import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";


const url = `https://toolproof-61ce0c80091e59b28999e161e82c61e1.default.us.langgraph.app`;
const graphName = "agent";
const client = new Client({
    apiUrl: "https://toolproof-61ce0c80091e59b28999e161e82c61e1.default.us.langgraph.app",
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