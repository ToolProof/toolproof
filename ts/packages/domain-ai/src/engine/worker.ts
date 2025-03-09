import { primeGoal } from './constants.js';
import { Direction, Actionable } from './types.js';
import { AIMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { OpenAI } from "@langchain/openai";

/**
 * Represents a Worker within ToolProof.
 * 
 * A Worker is an entity that operates toward a specified subgoal, defined by a direction object. This object includes:
 *  - A subgoal to pursue
 *  - A description of the direction
 *  - A suggested set of tools (though Workers may also utilize additional tools)
 * 
 * Workers generate an array of actionables—tasks that can be executed by Humans, and potentially in the future by Tools or other Workers, to achieve the specified subgoal.
 * 
 * Behavior:
 *  - If no direction is provided, a Worker defaults to pursuing the prime goal.
 *  - When multiple Workers are created with the same or similar subgoals (including the prime goal), ToolProof consolidates them into a single Worker to maximize efficiency.
 */
export class Worker<T> extends Runnable{

    direction: Direction;

    constructor(direction: Direction = { subGoal: primeGoal, description: '', tools: [] }) {
        super();
        this.direction = direction;
    }

    lc_namespace = []; // ATTENTION: empty array for now

    async invoke(state: T, options?: Partial<RunnableConfig<Record<string, any>>>) {
        return { messages: [new AIMessage('Nomen')] };
    }

    /**
     * Returns an array of actionables—tasks that contribute to achieving the subgoal.
     */
    getActionables(): Actionable[] {
        // const actionables: Actionable[] = someImplementation(this.direction);
        // return actionables;
        return []; // Returning an empty array to satisfy TypeScript
    }
}


// // Example usage
/* const worker = new Worker<typeof State.State>({
    subGoal: 'Cure Dementia with Lewy Bodies',
    description: 'Develop AI-driven workflows for drug discovery',
    tools: [
        createTool('autodock', {
            anchor: createResource('anchor', 'tp-data/resources/imatinib.txt'),
            target: createResource('target', 'tp-data/resources/1iep_no_lig.pdb'),
            box: createResource('box', 'tp-data/resources/xray-imatinib.pdb'),
        })
    ]
}); */