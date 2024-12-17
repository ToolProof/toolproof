import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";


const url = `https://swedish-pal-fd21683e4d295b9cbaa6b41412dfe328.default.us.langgraph.app`;
const graphName = "swedishPal";
const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id }};
const result = await remoteGraph.invoke({
  messages: [{ role: "user", content: "Who was the youngest member of The Beatles?" }],
}, config);

// verify that the state was persisted to the thread
/* const threadState = await remoteGraph.getState(config);
console.log(threadState); */

console.log(result);