import { GraphStateAnnotationRoot, GraphState } from '../types.js';
import { NodeAlpha } from '../nodes/nodeAlpha.js'; // ATTENTION: consider default exports
import { NodeBeta } from '../nodes/nodeBeta.js';
import { NodeGamma } from '../nodes/nodeGamma.js';
import { NodeDelta } from '../nodes/nodeDelta.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const edgeShouldRetry = (state: GraphState) => {
    // console.log('state :', state);
    if (state.resourceMap.shouldRetry.value) {
        console.log('edgeShouldRetry: shouldRetry is true');
        return 'nodeBeta';
    } else {
        return END;
    }
};


const stateGraph = new StateGraph(GraphStateAnnotationRoot)
    .addNode(
        'nodeAlpha',
        new NodeAlpha({
            inputKeys: ['anchor', 'target', 'box'],
        })
    )
    .addNode(
        'nodeBeta',
        new NodeBeta({
            inputKeys: ['anchor', 'target'],
            outputSpec: {
                outputKey: 'candidate',
                path: '',
                intraMorphism: 'doNothing',
                value: null,
            },
            interMorphism: 'abc', // ATTENTION: must validate that this morphism corresponds to the keys for input and output
        })
    )
    .addNode(
        'nodeDelta',
        new NodeDelta({
            inputSpecs: [
                {
                    key: 'candidate',
                    path: 'ligandokreado/1iep/timestamp/candidate.smi',
                }
            ]
        }),
    )
    .addNode(
        'nodeGamma',
        new NodeGamma({
            inputKeys: ['candidate', 'target', 'box'],
            outputDir: 'candidate', // ATTENTION: indicates same directory as candidate
            interMorphism: 'https://service-autodock-384484325421.europe-west2.run.app/autodock_basic',
        })
    )
    .addNode(
        'nodeAlpha2',
        new NodeAlpha({
            inputKeys: ['docking', 'pose'],
        })
    )
    .addNode(
        'nodeBeta2',
        new NodeBeta({
            inputKeys: ['docking', 'pose'],
            outputSpec: {
                outputKey: 'shouldRetry',
                path: '',
                intraMorphism: 'doNothing',
                value: null,
            },
            interMorphism: 'def', // ATTENTION: must validate that this morphism corresponds to the keys for input and output
        })
    )
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', 'nodeBeta')
    .addEdge('nodeBeta', 'nodeDelta')
    .addEdge('nodeDelta', 'nodeGamma')
    .addEdge('nodeGamma', 'nodeAlpha2')
    .addEdge('nodeAlpha2', 'nodeBeta2')
    .addConditionalEdges('nodeBeta2', edgeShouldRetry);

export const graph = stateGraph.compile();



