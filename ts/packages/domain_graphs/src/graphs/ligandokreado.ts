import { GraphStateAnnotationRoot, GraphState } from '../types.js';
import { NodeAlpha } from '../nodes/nodeAlpha.js';
import { NodeBeta } from '../nodes/nodeBeta.js';
import { NodeGamma } from '../nodes/nodeGamma.js';
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
            outputKey: 'candidate',
            intraMorphism: 'doNothing', // ATTENTION: should be packed with the outputKey
            outputDir: 'ligandokreado/1iep',
            interMorphism: 'abc', // ATTENTION: must validate that this morphism corresponds to the keys for input and output
            writeToShared: true,
        })
    )
    .addNode(
        'nodeGamma',
        new NodeGamma({
            url: 'https://service-tp-tools-384484325421.europe-west2.run.app/autodock_basic',
            inputKeys: ['candidate', 'target', 'box'],
            outputDir: 'candidate',
            intraMorphism: 'doNothing', // ATTENTION: should be packed with the output keys
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
            outputKey: 'shouldRetry',
            intraMorphism: 'doNothing', // ATTENTION: should be packed with the outputKey
            outputDir: '',
            interMorphism: 'def',
            writeToShared: false,
        })
    ) // ATTENTION
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', 'nodeBeta')
    .addEdge('nodeBeta', 'nodeGamma')
    .addEdge('nodeGamma', 'nodeAlpha2')
    .addEdge('nodeAlpha2', 'nodeBeta2')
    .addConditionalEdges('nodeBeta2', edgeShouldRetry);

export const graph = stateGraph.compile();



