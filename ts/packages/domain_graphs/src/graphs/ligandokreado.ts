import { GraphStateAnnotationRoot, GraphState } from '../types.js';
import { NodeAlpha } from '../nodes/nodeAlpha.js'; // ATTENTION: consider default exports
import { NodeBeta } from '../nodes/nodeBeta.js';
import { NodeGamma } from '../nodes/nodeGamma.js';
import { NodeDelta } from '../nodes/nodeDelta.js';
import { fetchRegistry, intraMorphismRegistry, interMorphismRegistry } from '../registries/registries.js';
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
            inputs: [
                {
                    key: 'anchor',
                    intraMorphisms: {
                        fetch: fetchRegistry.fetchContentFromUrl,
                        transform: intraMorphismRegistry.doNothing,
                    }
                },
                {
                    key: 'target',
                    intraMorphisms: {
                        fetch: fetchRegistry.fetchContentFromUrl,
                        transform: intraMorphismRegistry.chunkPDBContent,
                    }
                },
                {
                    key: 'box',
                    intraMorphisms: {
                        fetch: fetchRegistry.fetchContentFromUrl,
                        transform: intraMorphismRegistry.chunkPDBContent,
                    }
                },
            ]
        })
    )
    .addNode(
        'nodeBeta',
        new NodeBeta({
            inputs: ['anchor', 'target'],
            outputs: [
                {
                    key: 'candidate',
                    intraMorphisms: ['doNothing'],
                },
                {
                    key: 'foo',
                    intraMorphisms: ['doNothing'],
                },
            ] as const,
            interMorphism: interMorphismRegistry.generateCandidate2('candidate', 'foo2'),
        })
    )
    .addNode(
        'nodeDelta',
        new NodeDelta({
            inputs: [
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
            inputs: ['candidate', 'target', 'box'],
            outputDir: 'candidate', // ATTENTION: indicates same directory as candidate
            interMorphism: () => 'https://service-autodock-384484325421.europe-west2.run.app/autodock_basic',
        })
    )
    .addNode(
        'nodeAlpha2',
        new NodeAlpha({
            inputs: [
                {
                    key: 'docking',
                    intraMorphisms: {
                        fetch: fetchRegistry.fetchContentFromUrl,
                        transform: intraMorphismRegistry.doNothing,
                    }
                },
                {
                    key: 'pose',
                    intraMorphisms: {
                        fetch: fetchRegistry.fetchContentFromUrl,
                        transform: intraMorphismRegistry.doNothing,
                    }
                },
            ]
        })
    )
    .addNode(
        'nodeBeta2',
        new NodeBeta({
            inputs: ['docking', 'pose'],
            outputs: [
                {
                    key: 'shouldRetry',
                    intraMorphisms: ['doNothing'],
                }] as const,
            interMorphism: () => ({
                shouldRetry: '',
                shouldRetry2: '', // ATTENTION: no error
            }) // interMorphismRegistry.evaluateDockingResults
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



