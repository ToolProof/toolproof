import { primeGoal } from './goals.js';
import { Direction, Actionable, SubGoal } from './types.js';
import { AIMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';

/**
 * Represents a Worker within ToolProof.
 * 
 * A Worker is an entity that operates toward a specified subgoal, defined by a direction object. This object includes:
 *  - A subGoal to pursue (currently, only "curing a disease" is supported)
 *  - A description of the direction
 *  - A suggested set of tools (though Workers may also utilize additional tools)
 * 
 * NB: If no direction is provided, a Worker defaults to pursuing the prime goal.
 * 
 * To be implemented:
 * Workers generate an array of actionables—tasks that can be executed by Humans, and potentially in the future by Tools or other Workers, to achieve the specified subgoal.
 */
export class Worker<T> extends Runnable {

    direction: Direction;

    constructor(direction: Direction = { subGoal: new SubGoal(primeGoal), description: '', tools: [] }) {
        super();
        this.direction = direction;
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    /**
     * Invokes the Worker. This is the method that is run during graph execution.
     * 
     * @param state The current state of the Worker
     * @param options Optional configuration for the Worker
     */
    async invoke(state: T, options?: Partial<RunnableConfig<Record<string, any>>>) {
        return { messages: [new AIMessage('Worker is invoked')] };
    }

    alpha() {
        console.log('alpha');
    }

    beta() {
        console.log('beta');
    }

    gamma() {
        console.log('gamma');
    }

    /**
     * Returns an array of actionables that contribute to achieving the subgoal.
     */
    getActionables(): Actionable[] {
        // const actionables: Actionable[] = someImplementation(this.direction);
        // return actionables;
        return []; // Returning an empty array to satisfy TypeScript
    }
}