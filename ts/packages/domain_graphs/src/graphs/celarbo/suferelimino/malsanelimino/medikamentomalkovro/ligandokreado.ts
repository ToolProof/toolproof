import { BaseStateSpec, GraphSpec, registerGraph } from 'src/types.js';
import { NodeLoadInputs, NodeLoadInputsState } from 'src/nodes/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado/nodeLoadInputs.js';
import { NodeGenerateCandidate, NodeGenerateCandidateState } from 'src/nodes/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado/nodeGenerateCandidate.js';
import { NodeInvokeDocking, NodeInvokeDockingState } from 'src/nodes/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado/nodeInvokeDocking.js';
import { NodeLoadResults, NodeLoadResultsState } from 'src/nodes/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado/nodeLoadResults.js';
import { NodeEvaluateResults, NodeEvaluateResultsState } from 'src/nodes/celarbo/suferelimino/malsanelimino/medikamentomalkovro/ligandokreado/nodeEvaluateResults.js';
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';


type WithBaseState = ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeStart extends Runnable {

    static graphSpec: GraphSpec = {
        name: 'NodeStart',
        description: '',
        operation: {
            direction: 'write',
            storage: 'private',
            resources: [
            ]
        },
        conditionalEdges: [
            {
                name: 'edgeShouldRetry',
                source: 'nodeEvaluateResults',
                targets: ['nodeGenerateCandidate', END]
            }
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        if (state.dryRunModeManager.dryRunMode) {
            // await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));
            return {
                messages: [new AIMessage('NodeStart completed in DryRun mode')],
            };
        }

        return {
            messages: [new AIMessage('NodeStart completed')],
        };
    }

}

export const NodeStart = registerGraph<typeof _NodeStart>(_NodeStart);


const GraphState = Annotation.Root({
    ...BaseStateSpec,
    ...NodeLoadInputsState.spec,
    ...NodeGenerateCandidateState.spec,
    ...NodeInvokeDockingState.spec,
    ...NodeLoadResultsState.spec,
    ...NodeEvaluateResultsState.spec,
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
    .addNode('nodeStart', new NodeStart())
    .addNode('nodeLoadInputs', new NodeLoadInputs())
    .addNode('nodeGenerateCandidate', new NodeGenerateCandidate())
    .addNode('nodeInvokeDocking', new NodeInvokeDocking())
    .addNode('nodeLoadResults', new NodeLoadResults())
    .addNode('nodeEvaluateResults', new NodeEvaluateResults())
    .addEdge(START, 'nodeStart')
    .addEdge('nodeStart', 'nodeLoadInputs')
    .addEdge('nodeLoadInputs', 'nodeGenerateCandidate')
    .addEdge('nodeGenerateCandidate', 'nodeInvokeDocking')
    .addEdge('nodeInvokeDocking', 'nodeLoadResults')
    .addEdge('nodeLoadResults', 'nodeEvaluateResults')
    .addConditionalEdges('nodeEvaluateResults', edgeShouldRetry);


export const graph = stateGraph.compile();



