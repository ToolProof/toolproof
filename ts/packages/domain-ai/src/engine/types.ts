import { tools, resourceRoles, ToolType, ResourceRoleType } from './constants.js';


// Extract specific literal values from a readonly Set
type ExtractSetValues<T> = T extends ReadonlySet<infer U> ? U : never;

// Extract required inputs and outputs for a specific tool
export type RequiredToolInputs<T extends ToolType> = ExtractSetValues<(typeof tools)[T]['inputs']>;
export type RequiredToolOutputs<T extends ToolType> = ExtractSetValues<(typeof tools)[T]['outputs']>;


// Testing required inputs and outputs for the autodock tool
const requiredToolInputs_1: RequiredToolInputs<'autodock'> = 'ligand_smiles'; // ✅ Works
const requiredToolInputs_2: RequiredToolInputs<'autodock'> = 'receptor_pdb';  // ✅ Works
const requiredToolInputs_3: RequiredToolInputs<'autodock'> = 'box_pdb';  // ✅ Works
// @ts-expect-error
const requiredToolInputs_4: RequiredToolInputs<'autodock'> = 'invalid_input_xyz'; // ❌ Correctly errors

const requiredToolOutputs_1: RequiredToolOutputs<'autodock'> = 'docking_result_pdb'; // ✅ Works
const requiredToolOutputs_2: RequiredToolOutputs<'autodock'> = 'docking_pose_sdf';   // ✅ Works
// @ts-expect-error
const requiredToolOutputs_3: RequiredToolOutputs<'autodock'> = 'invalid_output_xyz';  // ❌ Correctly errors


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
    description: (typeof tools)[T]['description'];
    // inputs: RequiredToolInputs<T>;
    // outputs: RequiredToolOutputs<T>;
    inputs: RequiredToolInputsObject<T>;
    outputs: RequiredToolOutputsObject<T>;
};

// Factory function to create a tool with its predefined description and required inputs and outputs
export const createTool = <T extends ToolType>(
    name: T,
    inputs: RequiredToolInputsObject<T>,
    outputs: RequiredToolOutputsObject<T>
): Tool<T> => {
    return {
        name,
        description: tools[name].description,
        inputs,
        outputs
    };
};

// Testing the creation of the autodock tool
const autodock = createTool("autodock",
    { ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" }, receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" }, box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" } },
    { docking_result_pdb: { role: "docking_result_pdb", path: "docking_result.pdb" }, docking_pose_sdf: { role: "docking_pose_sdf", path: "docking_pose.sdf" } }
);

// Define the structure of a Resource
export interface Resource {
    role: ResourceRoleType;
    path: string;
};

// Factory function to create a resource with its predefined description
export const createResource = <T extends ResourceRoleType>(
    role: T,
    path: string
): { role: T; path: string; description: string } => ({
    role,
    description: resourceRoles[role].description,
    path
});

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

// Actionable type
export type Actionable = string; // must semantically satisfy certain conditions

// Define the structure of a Strategy
export type Strategy<T extends readonly ToolType[]> = {
    subGoals: SubGoal[];
    description: string;
    // tools: [...{ [K in keyof T]: Tool<T[K]> }]; // ✅ Enforce tuple structure
    tools: Set<ToolType>;
    resources: RequiredResourcesObject<Tool<T[number]>[]>;
};

// Testing valid strategy
const validStrategy: Strategy<["autodock"]> = {
    subGoals: [],
    description: "Example strategy using autodock",
    tools: new Set<ToolType>(["autodock"]),
    resources: {
        ligand_smiles: { role: "ligand_smiles", path: "/path/ligand_smiles" },
        receptor_pdb: { role: "receptor_pdb", path: "/path/receptor_pdb" },
        box_pdb: { role: "box_pdb", path: "/path/box_pdb" }
    }
};