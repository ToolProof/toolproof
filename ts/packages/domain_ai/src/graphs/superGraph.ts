import { subGraphs } from "./subGraphs.js";
import { Employment } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { db } from "../../firebaseAdminInit.js";

import { Client } from '@langchain/langgraph-sdk';

const url = `http://localhost:2024`;
const graphName = 'alpha';

const client = new Client({
    apiUrl: url,
});

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    employmentId: Annotation<string>({
        reducer: (prev, next) => next
    }),
    employment: Annotation<Employment>({
        reducer: (prev, next) => next
    }),
});

const nodeFetchEmployment = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        if (!state.employmentId) {
            throw new Error("Employment ID is missing");
        }

        // Get employment document
        const employmentRef = db.collection("employments").doc(state.employmentId);
        const employmentSnap = await employmentRef.get();

        if (!employmentSnap.exists) {
            throw new Error(`Employment with ID ${state.employmentId} not found`);
        }

        // ATTENTION_RONAK: Here we must ensure that this gets populated properly
        const employment: Employment = employmentSnap.data() as Employment;

        if (!employment) {
            throw new Error("Employment document is empty");
        }

        return {
            messages: [new AIMessage("Employment data fetched successfully")],
            employment: employment
        };
    } catch (error: any) {
        console.error("Error in nodeFetchEmployment:", error);
        return {
            messages: [new AIMessage(`Error fetching employment: ${error.message}`)]
        };
    }
};

const nodeInvokeSubgraph = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        // Use paths from state
        const subGraphState = {
            messages: [
                { "role": "user", "content": "Alpha Graph is invoked"}
            ],
            employment: state.employment
        };

        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 mins timeout

        const thread = await client.threads.create();

        let result: any;
        try {
            // Invoke the subGraph with abort signal
            // ATTENTION_RONAK: Invoke Python subGraph instead
            

            // result = await subGraphs[state.recipe.name].invoke(subGraphState, {
            //     signal: controller.signal
            // });

            const streamResponse = client.runs.stream(
                thread.thread_id,
                graphName,
                {
                    input: subGraphState,
                    streamMode: "messages",
                    signal: controller.signal
                }
            );
            
            console.log('streamResponse :', streamResponse);
            for await (const chunk of streamResponse) {
                console.log(`Receiving new event of type: ${chunk.event}...`);
                console.log(JSON.stringify(chunk.data));
                console.log("\n\n");
            }
        } finally {
            clearTimeout(timeout);
            controller.abort(); // Cleanup the controller
        }

        return {
            messages: [...result.messages, new AIMessage("SubGraph completed ")],
        };

    } catch (error: any) {
        console.error("Error in nodeInvokeSubgraph:", error);
        return {
            messages: [new AIMessage(`Error invoking subGraph: ${error.message}`)]
        };
    }
};

const edgeShouldContinue = (state: typeof State.State) => {
    console.log('state :', state);
    if (false) {
        return 'nodeInvokeSubgraph';
    } else {
        return END;
    }
}

const stateGraph = new StateGraph(State)
    .addNode("nodeFetchEmployment", nodeFetchEmployment)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeFetchEmployment")
    .addEdge("nodeFetchEmployment", "nodeInvokeSubgraph")
    .addConditionalEdges("nodeInvokeSubgraph", edgeShouldContinue)

export const graph = stateGraph.compile();
