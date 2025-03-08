import { ResourceType, ToolType, Tool, RequiredResourcesObject, Worker } from './types';

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

// ✅ **Correct Usage (ALL REQUIRED RESOURCES INCLUDED, NO ERRORS)**
const worker = new Worker({
    subGoal: 'Cure Dementia with Lewy Bodies',
    description: 'Develop AI-driven workflows for drug discovery',
    tools: [
        createTool('autodock', {
            anchor: createResource('anchor', 'tp-data/resources/imatinib.txt'),
            target: createResource('target', 'tp-data/resources/1iep_no_lig.pdb'),
            box: createResource('box', 'tp-data/resources/xray-imatinib.pdb'),
        })
    ]
});

console.log(worker.getActionables()); // []