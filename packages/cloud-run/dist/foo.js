"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fooHandler;
const langgraph_sdk_1 = require("@langchain/langgraph-sdk");
const remote_1 = require("@langchain/langgraph/remote");
const messages_1 = require("@langchain/core/messages");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const firebaseAdminHelpers_1 = require("./firebaseAdminHelpers");
const urlLocal = `https://toolproof.loca.lt`;
const url = process.env.URL || urlLocal;
const graphName = "test";
const client = new langgraph_sdk_1.Client({
    apiUrl: url,
});
const remoteGraph = new remote_1.RemoteGraph({ graphId: graphName, url });
// ATTENTION: must ensure idempotency
async function fooHandler(req, res) {
    try {
        // Create a thread (or use an existing thread instead)
        const thread = await client.threads.create();
        // Invoke the graph with the thread config
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke({
            messages: [new messages_1.HumanMessage("The target disease is Diabetes Type 2.")],
        });
        // Verify that the state was persisted to the thread (optional)
        // const threadState = await remoteGraph.getState(config);
        // console.log(threadState);
        // console.log("Result:", result);
        // Ensure the directory exists
        if (!fs_1.default.existsSync('/tmp')) {
            fs_1.default.mkdirSync('/tmp', { recursive: true });
        }
        // Save result to a .md file
        const now = new Date();
        const fileName = `${now.toISOString()}.md`;
        const filePath = path_1.default.join('/tmp', fileName);
        fs_1.default.writeFileSync(filePath, JSON.stringify(result.messages[0].content, null, 2) +
            "\n-----\n" +
            JSON.stringify(result.messages[1].content, null, 2) +
            "\n-----\n" +
            JSON.stringify(result.messages[2].content, null, 2));
        // Upload the file to GCP Cloud Storage
        await (0, firebaseAdminHelpers_1.uploadFileToStorage)(filePath, fileName);
        // Upload the file name to Firestore
        await (0, firebaseAdminHelpers_1.uploadFileNameToFirestore)(fileName);
        // Send a success response to Pub/Sub
        res.status(200).send("Task completed successfully");
    }
    catch (error) {
        console.error("Error invoking graph:", error);
        // Send a failure response to Pub/Sub
        res.status(500).send("Task failed");
    }
}
