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
        // Extract paths from recipe
        const { ligand_smiles, receptor_pdb, box_pdb, } = state.recipe.recipeSpecs[state.subGoal].inputs;
        if (!ligand_smiles || !receptor_pdb || !box_pdb) {
            throw new Error("Missing required resource paths");
        }

        // Create initial state for autodock graph with paths
        const subGraphState = {
            messages: state.messages,
            ligandAnchor: {
                path: ligand_smiles.path
            },
            receptor: {
                path: receptor_pdb.path
            },
            box: {
                path: box_pdb.path
            },
            shouldRetry: false
        };

        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 mins timeout

        let result;
        try {
            // Invoke the subGraph with abort signal
            result = await subGraphs[state.recipe.name].invoke(subGraphState, {
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
            controller.abort(); // Cleanup the controller
        }

        return {
            messages: result.messages
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
