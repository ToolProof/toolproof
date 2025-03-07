import { Client } from '@langchain/langgraph-sdk';
import { RemoteGraph } from '@langchain/langgraph/remote';
import { HumanMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
dotenv.config();

const url = 'http://localhost:2024'; // ts graph
const client = new Client({ apiUrl: url });

async function testCombinedGraph() {
    try {
        // Create a thread
        const thread = await client.threads.create();
        console.log('Created thread:', thread.thread_id);

        // Initialize the combined graph
        const combinedGraph = new RemoteGraph({ 
            graphId: 'combined_graph',  // Changed to directly test ts graph
            url 
        });

        // Test message
        const testMessage = "Analyze the chemical compound C6H12O6 (glucose)";

        // Test the graph
        console.log("\nTesting Chemical Analysis:");
        const result = await combinedGraph.invoke({
            messages: [new HumanMessage(testMessage)]
        });

        console.log("\nFinal Result:");
        if (result.messages) {
            result.messages.forEach((msg: any, i: number) => {
                console.log(`Message ${i + 1}:`, msg.content);
            });
        } else {
            console.log("No messages in response");
        }

    } catch (error) {
        console.error("Error in chemical analysis:", error);
    }
}

// Run the test
console.log("Starting chemical analysis test...");
testCombinedGraph()
    .then(() => console.log("Test complete"))
    .catch(console.error);
