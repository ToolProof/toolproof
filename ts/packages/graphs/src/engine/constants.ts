
// Defines the core objective of ToolProof
export const primeGoal = 'remove suffering and promote well-being';

// Centralized metadata for tools, including descriptions and required resources
export const TOOL_METADATA = {
    autodock: {
        description: 'A tool for docking',
        requiredResources: ['anchor', 'target', 'box'] as const
    }
} as const;

// Centralized metadata for resources, including descriptions
export const RESOURCE_METADATA = {
    anchor: { description: 'An anchor for docking' },
    target: { description: 'A target for docking' },
    box: { description: 'A box for docking' }
} as const;

