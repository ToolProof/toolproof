import { BaseStateSpec } from '../types.js';
import { NodeAlpha } from '../nodes/nodeAlpha.js';
import { NodeBeta } from '../nodes/nodeBeta.js';
import { NodeGamma } from '../nodes/nodeGamma.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';

const GraphState = Annotation.Root({
    ...BaseStateSpec,
    shouldRetry: Annotation<boolean>(), // ATTENTION: consider moving to BaseStateSpec
});

const edgeShouldRetry = (state: typeof GraphState.State) => {
    console.log('state :', state);
    if (state.shouldRetry) {
        return 'nodeBeta';
    } else {
        return END;
    }
};

const stateGraph = new StateGraph(GraphState)
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
        })
    )
    .addNode(
        'nodeGamma',
        new NodeGamma({
            url: 'https://service-tp-tools-384484325421.europe-west2.run.app/autodock_basic',
            inputKeys: ['candidate', 'target', 'box'],
            outputPath: 'dummyPath',
        })
    )
    /*
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
            outputKey: 'decision',
            outputDir: '',
            interMorphism: 'abc',
        })
    ) */ // ATTENTION
    .addEdge(START, 'nodeAlpha')
    .addEdge('nodeAlpha', 'nodeBeta')
    .addEdge('nodeBeta', 'nodeGamma')
    .addEdge('nodeGamma', END)
/*
.addEdge('nodeGamma', 'nodeAlpha2')
.addEdge('nodeAlpha2', 'nodeBeta2')
.addConditionalEdges('nodeBeta2', edgeShouldRetry); */

export const graph = stateGraph.compile();



