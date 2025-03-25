import { subGraphs } from "./subGraphs.js";
import { ApplicationData } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { db } from "../../firebaseAdminInit.js";


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    application: Annotation<{ id: string, data: ApplicationData }>({
        reducer: (prev, next) => next
    }),
});

const nodeFetchApplication = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        if (!state.application.id) {
            throw new Error("Application ID is missing");
        }

        // Get application document
        const applicationRef = db.collection("applications").doc(state.application.id);
        const applicationSnap = await applicationRef.get();

        if (!applicationSnap.exists) {
            throw new Error(`Application with ID ${state.application.id} not found`);
        }

        // ATTENTION_RONAK: Here we must ensure that this gets populated properly
        const applicationData: ApplicationData = applicationSnap.data() as ApplicationData;

        if (!applicationData) {
            throw new Error("Application document is empty");
        }

        return {
            messages: [new AIMessage("Application data fetched successfully")],
            application: {
                ...state.application,
                data: applicationData,
            },
        };
    } catch (error: any) {
        console.error("Error in nodeFetchApplication:", error);
        return {
            messages: [new AIMessage(`Error fetching application: ${error.message}`)]
        };
    }
};

const nodeInvokeSubgraph = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        // Use paths from state
        const subGraphState = {
            messages: state.messages,
            application: state.application
        };

        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 mins timeout

        let result: any;
        try {
            // Invoke the subGraph with abort signal
            // ATTENTION_RONAK: Invoke Python subGraph instead

            result = await subGraphs[state.recipe.name].invoke(subGraphState, {
                signal: controller.signal
            });
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
    .addNode("nodeFetchApplication", nodeFetchApplication)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeFetchApplication")
    .addEdge("nodeFetchApplication", "nodeInvokeSubgraph")
    .addConditionalEdges("nodeInvokeSubgraph", edgeShouldContinue)

export const graph = stateGraph.compile();
