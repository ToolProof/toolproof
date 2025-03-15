import { tools, ToolType } from './tools.js';


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

// Helper interface to define a flattened Tool object
export interface Tool<T extends ToolType = ToolType> {
    name: T;
    description: (typeof tools)[T]['description'];
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
type ExtractRequiredRecipeInputs<T extends Tool[]> = Exclude<UnionOfToolInputs<T>, UnionOfToolOutputs<T>>;

// Compute Required Resources as an object
export type RequiredRecipeInputsObject<T extends Tool[]> = {
    [K in ExtractRequiredRecipeInputs<T>]: { role: K; path: string };
};


// Define the structure of a SubGoal
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

// Define the structure of a Disease
export class Disease extends Remove {
    icd_11_entry: ICD_11_Entry;

    constructor(icd_11_entry: ICD_11_Entry) {
        super(`Cure ${icd_11_entry.name}`);
        this.icd_11_entry = icd_11_entry;
    }
}

// Actionable type
export type Actionable = string; // must semantically satisfy certain conditions

// Define the structure of a RecipeSpec
// A RecipeSpec requires all the inputs that the tools of its associated Recipe require, net of those that the tools of its associated Recipe output
export interface RecipeSpec<T extends readonly ToolType[]> {
    tools: T;
    inputs: RequiredRecipeInputsObject<Tool<T[number]>[]>;
};

// Define the structure of a Recipe
export interface Recipe<T extends ToolType[]> {
    description: string;
    recipeSpecs: Record<string, RecipeSpec<T>>;
}

// Define ToolMethods where each method is a generic function
export type ToolMethods<Tools extends readonly string[]> = {
    [K in Tools[number]]: <T>(t: T) => Partial<T>;
};