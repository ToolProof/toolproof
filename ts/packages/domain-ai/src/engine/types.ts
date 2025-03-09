import { TOOL_METADATA, RESOURCE_METADATA, primeGoal } from './constants.js';


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


// Factory function to create a resource with its predefined description
export const createResource = <T extends ResourceType>(
    name: T,
    path: string
): { name: T; path: string; description: string } => ({
    name,
    description: RESOURCE_METADATA[name].description,
    path
});

// Factory function to create a tool with its predefined description and required resources
export const createTool = <T extends ToolType>(
    name: T,
    resources: RequiredResourcesObject<T>
): Tool<T> & { description: string } => {
    return {
        name,
        description: TOOL_METADATA[name].description,
        resources
    };
};