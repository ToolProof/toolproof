import dotenv from "dotenv";
dotenv.config();
import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';

// Make sure to update langgraph.json to include this graph
const url = `http://localhost:8123`;  
const graphName = 'repo_analyzer_graph';

const client = new Client({
    apiUrl: url,
});
const remoteGraph = new RemoteGraph({ graphId: graphName, url });

async function main() {
    try {
        // Create a thread
        const thread = await client.threads.create();
        console.log('Created thread:', thread.thread_id);

        // Replace with your actual GitHub repository details
        const repoUrl = "https://github.com/ToolProof/toolproof.git";
        // No need to provide username or password for public repos
        
        // Invoke the graph
        const config = { configurable: { thread_id: thread.thread_id } };
        const result = await remoteGraph.invoke(
            {
                messages: [new HumanMessage('Analyze the repository code')],
                repoUrl: repoUrl
                // Username and password are completely optional and can be omitted
            },
            config
        );

        console.log('Analysis Result:');
        if (result.messages && result.messages.length > 0) {
            console.log(result.messages[result.messages.length - 1].content);
        } else {
            console.log('No analysis messages returned');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
