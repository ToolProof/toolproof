import { BaseStateSpec, GraphSpec, registerGraph } from 'src/types.js';
import { NodeFoo, NodeFooState } from 'src/nodes/meta/nodeFoo.js';
import { StateGraph, Annotation, MessagesAnnotation, START, END } from '@langchain/langgraph';
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
        conditionalEdges: []
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
    ...NodeFooState.spec,
});


const stateGraph = new StateGraph(GraphState)
    .addNode('nodeFoo', new NodeFoo())
    .addEdge(START, 'nodeFoo')
    .addEdge('nodeFoo', END);

export const graph = stateGraph.compile();
