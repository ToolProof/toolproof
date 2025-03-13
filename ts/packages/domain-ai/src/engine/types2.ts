import { TOOL_METADATA, RESOURCE_ROLE_METADATA, FooType } from './constants2.js';

// Extract types from metadata keys
export type ToolType = keyof typeof TOOL_METADATA;
export type ResourceRoleType = keyof typeof RESOURCE_ROLE_METADATA;

// Extract specific literal values from a readonly Set
type ExtractSetValues<T> = T extends ReadonlySet<infer U> ? U : never;

// Extract required inputs and outputs for a specific tool
export type RequiredToolInputs<T extends ToolType> = ExtractSetValues<(typeof TOOL_METADATA)[T]['inputs']>;
export type RequiredToolOutputs<T extends ToolType> = ExtractSetValues<(typeof TOOL_METADATA)[T]['outputs']>;


// Testing: This should work correctly
const requiredToolInputs_1: RequiredToolInputs<'A'> = 'Alpha'; // ✅ Works
const requiredToolInputs_2: RequiredToolInputs<'A'> = 'Beta';  // ✅ Works
// @ts-expect-error
const requiredToolInputs_3: RequiredToolInputs<'A'> = 'Gamma'; // ❌ Correctly errors

const requiredToolOutputs_1: RequiredToolOutputs<'A'> = 'Alpha2'; // ✅ Works
const requiredToolOutputs_2: RequiredToolOutputs<'A'> = 'Beta2';   // ✅ Works
// @ts-expect-error
const requiredToolOutputs_3: RequiredToolOutputs<'A'> = 'Gamma';  // ❌ Correctly errors


// Strictly enforce required inputs and outputs as an object
export type RequiredToolInputsObject<T extends ToolType> = {
    [K in RequiredToolInputs<T>]: { role: K; path: string };
};

export type RequiredToolOutputsObject<T extends ToolType> = {
    [K in RequiredToolOutputs<T>]: { role: K; path: string };
};

// Define the structure of a Tool
export interface Tool<T extends ToolType = ToolType> {
    name: T;
    inputs: RequiredToolInputsObject<T>;
    outputs: RequiredToolOutputsObject<T>;
};

// Extract the union of all input resource roles from a list of tools
type UnionOfToolInputs<T extends Tool[]> = T extends (infer U)[]
    ? U extends Tool
    ? keyof U["inputs"]
    : never
    : never;

// Extract the union of all output resource roles from a list of tools
type UnionOfToolOutputs<T extends Tool[]> = T extends (infer U)[]
    ? U extends Tool
    ? keyof U["outputs"]
    : never
    : never;

// Compute Required Resources = Inputs - Outputs
type ExtractRequiredResources<T extends Tool[]> = Exclude<UnionOfToolInputs<T>, UnionOfToolOutputs<T>>;

// Compute Required Resources as an object
export type RequiredResourcesObject<T extends Tool[]> = {
    [K in ExtractRequiredResources<T>]: { role: K; path: string };
};

// Define the structure of a Resource
export interface Resource {
    role: ResourceRoleType;
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

// ICD is the International Classification of Diseases
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

// Define the structure of a Strategy
export type Strategy<T extends readonly ToolType[]> = {
    subGoals: SubGoal[];
    description: string;
    tools: [...{ [K in keyof T]: Tool<T[K]> }]; // ✅ Enforce tuple structure
    resources: RequiredResourcesObject<Tool<T[number]>[]>;
};

// Factory function to create a resource with its predefined description
export const createResource = <T extends ResourceRoleType>(
    role: T,
    path: string
): { role: T; path: string; description: string } => ({
    role,
    description: RESOURCE_ROLE_METADATA[role].description,
    path
});

// Factory function to create a tool with its predefined description and required inputs and outputs
export const createTool = <T extends ToolType>(
    name: T,
    inputs: RequiredToolInputsObject<T>,
    outputs: RequiredToolOutputsObject<T>
): Tool<T> & { description: string } => {
    return {
        name,
        description: TOOL_METADATA[name].description,
        inputs,
        outputs
    };
};

// Actionable type
export type Actionable = string; // must semantically satisfy certain conditions

const toolA = createTool("A",
    { Alpha: { role: "Alpha", path: "/path/alpha" }, Beta: { role: "Beta", path: "/path/beta" } },
    { Alpha2: { role: "Alpha2", path: "/path/alpha2" }, Beta2: { role: "Beta2", path: "/path/beta2" } }
);

const toolB = createTool("B",
    { Alpha2: { role: "Alpha2", path: "/path/alpha2" }, Gamma: { role: "Gamma", path: "/path/gamma" } },
    { Alpha3: { role: "Alpha3", path: "/path/alpha3" }, Gamma2: { role: "Gamma2", path: "/path/gamma2" } }
);

const toolC = createTool("C",
    { Alpha3: { role: "Alpha3", path: "/path/alpha3" }, Gamma2: { role: "Gamma2", path: "/path/gamma2" } },
    { Alpha4: { role: "Alpha4", path: "/path/alpha4" }, Gamma3: { role: "Gamma3", path: "/path/gamma3" } }
);

const toolD = createTool("D",
    { Ypsilon: { role: "Ypsilon", path: "/path/ypsilon" }, Delta: { role: "Delta", path: "/path/delta" } },
    { Alpha5: { role: "Alpha5", path: "/path/alpha5" }, Delta2: { role: "Delta2", path: "/path/delta2" } }
);

// Testing valid strategy
const validStrategy: Strategy<["A", "B", "C", "D"]> = {
    subGoals: [],
    description: "Example strategy using A, B, C, and D",
    tools: [toolA, toolB, toolC, toolD] as [typeof toolA, typeof toolB, typeof toolC, typeof toolD], // ✅ Explicitly define tuple
    resources: {
        Alpha: { role: "Alpha", path: "/path/alpha" },
        Beta: { role: "Beta", path: "/path/beta" },
        Gamma: { role: "Gamma", path: "/path/gamma" },
        Delta: { role: "Delta", path: "/path/delta" },
        Ypsilon: { role: "Ypsilon", path: "/path/ypsilon" },
    }
};