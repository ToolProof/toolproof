import { GraphSpec, BaseStateSpec, registerGraph } from '../../../types.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';


type WithBaseState = ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeIterativeDocking extends Runnable {

    static graphSpec: GraphSpec = {
        name: 'NodeIterativeDocking',
        description: '',
        operation: {
            direction: 'write',
            storage: 'private',
            resources: [
                { name: 'anchor', kind: 'value' },
                { name: 'target', kind: 'value' },
                { name: 'box', kind: 'value' }
            ]
        }
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        return {
            messages: [new AIMessage('Iterative docking started')],
        };
    }

}

export const NodeIterativeDocking = registerGraph<typeof _NodeIterativeDocking>(_NodeIterativeDocking);