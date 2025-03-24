import { subGraphs } from "./subGraphs.js";
import { Recipe } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    subGoal: Annotation<string>({
        reducer: (prev, next) => next
    }),
    recipe: Annotation<Recipe>({
        reducer: (prev, next) => next
    }),
});


const edgeShouldContinue = (state: typeof State.State) => {
    if (false) {
        return 'nodeInvokeSubgraph';
    } else {
        return END;
    }
}


const nodeInvokeSubgraph = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {

    try {

        // Create initial state for autodock graph with paths
        // ATTENTION_RONAK: These paths are hardcoded for now, but they should be fetched Firestore
        const subGraphState = {
            messages: state.messages,
            ligandAnchor: {
                path: "tp_resources/E4K9TgYvQ4cG9Gl64ALw.txt"
            },
            receptor: {
                path: "tp_resources/PeeAt29vtih4HTyu2IFC.pdb"
            },
            box: {
                path: "tp_resources/oK9g0fukcrfsHrmRklPB.pdb"
            },
            shouldRetry: false
        };

        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 mins timeout

        let result;
        try {
            // Invoke the subGraph with abort signal
            // ATTENTION_RONAK: Invoke Python subGraph instead
            /* result = await subGraphs[state.recipe.name].invoke(subGraphState, {
                signal: controller.signal
            }); */
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


const stateGraph = new StateGraph(State)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeInvokeSubgraph")
    .addConditionalEdges("nodeInvokeSubgraph", edgeShouldContinue)


export const graph = stateGraph.compile();
