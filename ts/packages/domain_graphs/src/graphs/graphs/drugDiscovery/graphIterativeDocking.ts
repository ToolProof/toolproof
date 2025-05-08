import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { BaseStateSpec } from '../../types.js';
import { NodeLoadInputs, NodeLoadInputsState } from '../../nodes/drugDiscovery/nodeLoadInputs.js';
import { NodeGenerateCandidate, NodeGenerateCandidateState } from '../../nodes/drugDiscovery/nodeGenerateCandidate.js';
// import { NodeGenerateBox, NodeGenerateBoxState } from '../nodes/nodeGenerateBox.js';
import { NodeInvokeDocking, NodeInvokeDockingState } from '../../nodes/drugDiscovery/nodeInvokeDocking.js';
import { NodeLoadResults, NodeLoadResultsState } from '../../nodes/drugDiscovery/nodeLoadResults.js';
import { NodeEvaluateResults, NodeEvaluateResultsState } from '../../nodes/drugDiscovery/nodeEvaluateResults.js';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeLoadInputsState.spec,
    ...NodeGenerateCandidateState.spec,
    // ...NodeGenerateBoxState.spec,
    ...NodeInvokeDockingState.spec,
    ...NodeLoadResultsState.spec,
    ...NodeEvaluateResultsState.spec,
});


const edgeShouldRetry = (state: typeof GraphState.State) => {
    console.log('state :', state);
    if (state.shouldRetry) {
        return 'nodeGenerateCandidate';
    } else {
        return END;
    }
};


const stateGraph = new StateGraph(GraphState)
    .addNode("nodeLoadInputs", new NodeLoadInputs())
    .addNode("nodeGenerateCandidate", new NodeGenerateCandidate())
    // .addNode("nodeGenerateBox", new NodeGenerateBox())
    .addNode("nodeInvokeDocking", new NodeInvokeDocking())
    .addNode("nodeLoadResults", new NodeLoadResults())
    .addNode("nodeEvaluateResults", new NodeEvaluateResults())
    .addEdge(START, "nodeLoadInputs")
    .addEdge("nodeLoadInputs", "nodeGenerateCandidate")
    .addEdge("nodeGenerateCandidate", "nodeInvokeDocking")
    .addEdge("nodeInvokeDocking", "nodeLoadResults")
    .addEdge("nodeLoadResults", "nodeEvaluateResults")
    .addConditionalEdges("nodeEvaluateResults", edgeShouldRetry);


export const alphaGraph = stateGraph.compile();
