import { GraphStateAnnotationRoot } from '../../types.js';
import { NodeEpsilon } from '../../nodes/nodeEpsilon.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const stateGraph = new StateGraph(GraphStateAnnotationRoot)
    .addNode('nodeEpsilon', new NodeEpsilon({
        inputKeys: ['container'],
    }))
    .addEdge(START, 'nodeEpsilon')
    .addEdge('nodeEpsilon', END);

export const graph = stateGraph.compile();
