import { primeGoal, TOOL_METADATA, RESOURCE_METADATA } from './toolproof';

// Extract types from metadata keys
export type ToolType = keyof typeof TOOL_METADATA;
export type ResourceType = keyof typeof RESOURCE_METADATA;

// Extract required resources for a specific tool
export type RequiredResourcesFor<T extends ToolType> = (typeof TOOL_METADATA)[T]['requiredResources'][number];

// Strictly enforce required resources as an object
export type RequiredResourcesObject<T extends ToolType> = {
    [K in RequiredResourcesFor<T>]: { name: K; path: string };
};

// Define the structure of a Tool
export type Tool<T extends ToolType = ToolType> = {
    name: T;
    resources: RequiredResourcesObject<T>;
};

// Define the structure of a Resource
export type Resource = {
    name: ResourceType;
    path: string;
};

// Define the structure of a Direction
export type Direction = {
    subGoal: string; // must semantically satisfy certain conditions
    description: string;
    tools: Tool[];
};

// Actionable type
export type Actionable = string; // must semantically satisfy certain conditions


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
export class Worker { // implements Runnable
    direction: Direction;

    constructor(direction: Direction = { subGoal: primeGoal, description: '', tools: [] }) {
        this.direction = direction;
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
