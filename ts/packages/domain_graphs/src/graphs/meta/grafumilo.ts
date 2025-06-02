import { GraphStateAnnotationRoot } from '../../types.js';
import { NodeAlpha } from '../../nodes/nodeAlpha.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const stateGraph = new StateGraph(GraphStateAnnotationRoot)
    .addNode('nodeAlpha', new NodeAlpha({
        inputs: [
            {
                key: 'candidate',
                intraMorphisms: {
                    fetch: 'fetchContentFromUrl2',
                    transform: 'getCandidates',
                }
            },
        ]
        /* inputs: [
            {
                key: 'container',
                intraMorphisms: {
                    fetch: 'fetchContentFromUrl',
                    transform: 'getNodeInvocationsFromSourceCode',
                }
            },
        ] */
    }))
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', END);

export const graph = stateGraph.compile();
