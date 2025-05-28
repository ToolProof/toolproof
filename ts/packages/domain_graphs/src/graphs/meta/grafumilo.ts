import { GraphStateAnnotationRoot } from '../../types.js';
import { NodeAlpha } from '../../nodes/nodeAlpha.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const stateGraph = new StateGraph(GraphStateAnnotationRoot)
    .addNode('nodeAlpha', new NodeAlpha({
        inputKeys: ['container'],
    }))
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', END);

export const graph = stateGraph.compile();
