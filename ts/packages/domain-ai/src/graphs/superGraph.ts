import { subGraphs } from "./subGraphs.js";
import { Recipe } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
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

    const subGraph = state.recipe.name;

    switch (subGraph) {
        case "alpha":
            // Invoke subGraphs["alpha"];
            break;
        default:
            break;
    }

    return { messages: [new AIMessage("Subgraph invoked")] };

};


const stateGraph = new StateGraph(State)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeInvokeSubgraph")
    .addConditionalEdges("nodeInvokeSubgraph", edgeShouldContinue);


export const graph = stateGraph.compile();
