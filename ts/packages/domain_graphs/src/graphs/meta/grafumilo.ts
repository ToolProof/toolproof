import { GraphStateAnnotationRoot } from '../../types.js';
import { NodeAlpha } from '../../nodes/nodeAlpha.js';
import { intraMorphismRegistry, fetchRegistry } from '../../registries/registries.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const stateGraph = new StateGraph(GraphStateAnnotationRoot)
    .addNode('nodeAlpha', new NodeAlpha({
        inputs: [
            {
                key: 'candidate',
                intraMorphisms: {
                    fetch: fetchRegistry.fetchContentFromUrl2,
                    transform: intraMorphismRegistry.getCandidates,
                }
            },
        ]
        /* inputs: [
            {
                key: 'container',
                intraMorphisms: {
                    fetch: fetchRegistry.fetchContentFromUrl2,
                    transform: intraMorphismRegistry.getNodeInvocationsFromSourceCode,
                }
            },
        ] */
    }))
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', END);

export const graph = stateGraph.compile();
