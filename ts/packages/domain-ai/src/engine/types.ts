import { TOOL_METADATA, RESOURCE_METADATA } from './constants.js';


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
export interface Tool<T extends ToolType = ToolType> {
    name: T;
    resources: RequiredResourcesObject<T>;
};

// Define the structure of a Resource
export interface Resource {
    name: ResourceType;
    path: string;
};

export class SubGoal {
    description: string;

    constructor(description: string) {
        this.description = description;
    }
}

export class Remove extends SubGoal {
    type: 'remove';

    constructor(description: string) {
        super(description);
        this.type = 'remove';
    }
}

export class Promote extends SubGoal {
    type: 'promote';

    constructor(description: string) {
        super(description);
        this.type = 'promote';
    }
}

export interface ICD_11_Entry {
    code: string;
    name: string;
}

export class Disease extends Remove {
    icd_11_entry: ICD_11_Entry;

    constructor(icd_11_entry: ICD_11_Entry) {
        super(`Cure ${icd_11_entry.name}`);
        this.icd_11_entry = icd_11_entry;
    }
}

// Define the structure of a Direction
export interface Direction {
    subGoal: SubGoal;
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