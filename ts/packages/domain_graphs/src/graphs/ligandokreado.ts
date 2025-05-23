import { BaseStateSpec } from '../types.js';
import { NodeLoadResources } from '../nodes/nodeLoadResources.js';
import { NodeGenerateCandidate, NodeGenerateCandidateState } from '../nodes/nodeGenerateCandidate.js';
import { NodeInvokeDocking, NodeInvokeDockingState } from '../nodes/nodeInvokeDocking.js';
import { NodeEvaluateResults, NodeEvaluateResultsState } from '../nodes/nodeEvaluateResults.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeGenerateCandidateState.spec,
    ...NodeInvokeDockingState.spec,
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
    .addNode('nodeLoadResources', new NodeLoadResources(['anchor', 'box']))
    .addNode('nodeGenerateCandidate', new NodeGenerateCandidate())
    .addNode('nodeInvokeDocking', new NodeInvokeDocking())
    .addNode('nodeLoadResources2', new NodeLoadResources(['docking', 'pose']))
    .addNode('nodeEvaluateResults', new NodeEvaluateResults())
    .addEdge(START, 'nodeLoadResources')
    .addEdge('nodeLoadResources', 'nodeGenerateCandidate')
    .addEdge('nodeGenerateCandidate', 'nodeInvokeDocking')
    .addEdge('nodeInvokeDocking', 'nodeLoadResources2')
    .addEdge('nodeLoadResources2', 'nodeEvaluateResults')
    .addConditionalEdges('nodeEvaluateResults', edgeShouldRetry);

export const graph = stateGraph.compile();



