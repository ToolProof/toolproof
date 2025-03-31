import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { BaseStateSpec } from '../../nodes/nodeUtils.js';
import { NodeLoadInputs, NodeLoadInputsState } from '../../nodes/nodeLoadInputs.js';
import { NodeGenerateCandidate, NodeGenerateCandidateState } from '../../nodes/nodeGenerateCandidate.js';
import { NodeGenerateBox, NodeGenerateBoxState } from '../../nodes/nodeGenerateBox.js';
import { NodeInvokeDocking, NodeInvokeDockingState_I } from '../../nodes/nodeInvokeDocking.js';
import { NodeLoadResults, NodeLoadResultsState } from '../../nodes/nodeLoadResults.js';
import { NodeEvaluateResults, NodeEvaluateResultsState } from '../../nodes/nodeEvaluateResults.js';
import { AIMessage } from "@langchain/core/messages";

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeLoadInputsState.spec,
    ...NodeGenerateCandidateState.spec,
    ...NodeGenerateBoxState.spec,
    ...NodeInvokeDockingState_I.spec,
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

const nodeStart = (state: typeof GraphState.State) => {
    console.log('state :', state);
    return {
        messages: [new AIMessage("SubGraph Started successfully")],
    };
};


const stateGraph = new StateGraph(GraphState)
    .addNode("nodeStart", nodeStart)
    .addNode("nodeLoadInputs", new NodeLoadInputs())
    .addNode("nodeGenerateCandidate", new NodeGenerateCandidate())
    .addNode("nodeGenerateBox", new NodeGenerateBox())
    .addNode("nodeInvokeDocking", new NodeInvokeDocking())
    .addNode("nodeLoadResults", new NodeLoadResults())
    .addNode("nodeEvaluateResults", new NodeEvaluateResults())
    .addEdge(START, "nodeStart")
    .addEdge("nodeStart", "nodeLoadInputs")
    .addEdge("nodeLoadInputs", "nodeGenerateCandidate")
    .addEdge("nodeGenerateCandidate", "nodeInvokeDocking")
    .addEdge("nodeInvokeDocking", "nodeLoadResults")
    .addEdge("nodeLoadResults", "nodeEvaluateResults")
    .addConditionalEdges("nodeEvaluateResults", edgeShouldRetry);


export const alphaGraph = stateGraph.compile();
