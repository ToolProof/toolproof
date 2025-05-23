import { BaseStateSpec } from '../types.js';
import { NodeLoadResources } from '../nodes/nodeLoadResources.js';
import { NodeGenerateCandidate } from '../nodes/nodeGenerateCandidate.js';
import { NodeInvokeDocking } from '../nodes/nodeInvokeDocking.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    shouldRetry: Annotation<boolean>(), // ATTENTION: consider moving to BaseStateSpec
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
    .addNode('nodeLoadResources', new NodeLoadResources({ inputKeys: ['anchor', 'target', 'box'] }))
    .addNode('nodeGenerateCandidate', new NodeGenerateCandidate({ inputKeys: ['anchor', 'target'], outputKeys: ['candidate'] }))
    .addNode('nodeInvokeDocking', new NodeInvokeDocking({ inputKeys: ['candidate', 'target', 'box'], outputKeys: ['docking', 'pose'] }))
    .addNode('nodeLoadResources2', new NodeLoadResources({ inputKeys: ['docking', 'pose'] }))
    .addNode('nodeGenerateCandidate2', new NodeGenerateCandidate({ inputKeys: ['docking', 'pose'], outputKeys: ['decision'] })) // ATTENTION
    .addEdge(START, 'nodeLoadResources')
    .addEdge('nodeLoadResources', 'nodeGenerateCandidate')
    .addEdge('nodeGenerateCandidate', 'nodeInvokeDocking')
    .addEdge('nodeInvokeDocking', 'nodeLoadResources2')
    .addEdge('nodeLoadResources2', 'nodeGenerateCandidate2')
    .addConditionalEdges('nodeGenerateCandidate2', edgeShouldRetry);

export const graph = stateGraph.compile();



