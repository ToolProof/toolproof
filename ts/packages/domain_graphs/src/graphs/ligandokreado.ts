import { BaseStateSpec } from '../types.js';
import { NodeLoadInputs, NodeLoadInputsState } from '../nodes/nodeLoadInputs.js';
import { NodeGenerateCandidate, NodeGenerateCandidateState } from '../nodes/nodeGenerateCandidate.js';
import { NodeInvokeDocking, NodeInvokeDockingState } from '../nodes/nodeInvokeDocking.js';
import { NodeLoadResults, NodeLoadResultsState } from '../nodes/nodeLoadResults.js';
import { NodeEvaluateResults, NodeEvaluateResultsState } from '../nodes/nodeEvaluateResults.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeLoadInputsState.spec,
    /* ...NodeGenerateCandidateState.spec,
    ...NodeInvokeDockingState.spec,
    ...NodeLoadResultsState.spec,
    ...NodeEvaluateResultsState.spec, */
});

/* const edgeShouldRetry = (state: typeof GraphState.State) => {
    console.log('state :', state);
    if (state.shouldRetry) {
        return 'nodeGenerateCandidate';
    } else {
        return END;
    }
}; */

const stateGraph = new StateGraph(GraphState)
    .addNode('nodeLoadInputs', new NodeLoadInputs()) // What about passing a graph-specific spec to the constructor?
    /* .addNode('nodeGenerateCandidate', new NodeGenerateCandidate())
    .addNode('nodeInvokeDocking', new NodeInvokeDocking())
    .addNode('nodeLoadResults', new NodeLoadResults())
    .addNode('nodeEvaluateResults', new NodeEvaluateResults()) */
    .addEdge(START, 'nodeLoadInputs')
    .addEdge('nodeLoadInputs', END)
/* .addEdge('nodeLoadInputs', 'nodeGenerateCandidate')
.addEdge('nodeGenerateCandidate', 'nodeInvokeDocking')
.addEdge('nodeInvokeDocking', 'nodeLoadResults')
.addEdge('nodeLoadResults', 'nodeEvaluateResults')
.addConditionalEdges('nodeEvaluateResults', edgeShouldRetry); */

export const graph = stateGraph.compile();



