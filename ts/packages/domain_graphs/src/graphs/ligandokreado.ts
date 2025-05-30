import { GraphStateAnnotationRoot, GraphState } from '../types.js';
import { NodeAlpha } from '../nodes/nodeAlpha.js'; // ATTENTION: consider default exports
import { NodeBeta } from '../nodes/nodeBeta.js';
import { NodeGamma } from '../nodes/nodeGamma.js';
import { NodeDelta } from '../nodes/nodeDelta.js';
import { NodeEpsilon } from '../nodes/nodeEpsilon.js';
import { StateGraph, START, END } from '@langchain/langgraph';


const edgeShouldRetry = (state: GraphState) => {
    // console.log('state :', state);
    if (state.metaResourceMap.shouldRetry) {
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
        'nodeEpsilon',
        new NodeEpsilon({
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
        'nodeDelta',
        new NodeDelta({
            inputKeys: ['docking', 'pose'],
            outputKey: 'shouldRetry',
            interMorphism: 'def',
        })
    )
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', 'nodeBeta')
    .addEdge('nodeBeta', 'nodeEpsilon')
    .addEdge('nodeEpsilon', 'nodeGamma')
    .addEdge('nodeGamma', 'nodeAlpha2')
    .addEdge('nodeAlpha2', 'nodeDelta')
    .addConditionalEdges('nodeDelta', edgeShouldRetry);

export const graph = stateGraph.compile();



