import { DocumentReference } from "firebase-admin/firestore";

interface Base {
    id: string;
    name: string;
    description: string;
}

export interface SubGoal extends Base { }

/*
    * For diseases, Base entries (i.e. id, name, and description) are given by the ICD-11 standard.
*/
export interface Disease extends SubGoal { }

export interface Tool extends Base {
    inputSpecs: string[];
    outputSpecs: string[];
}

export interface Strategy extends Base {
    subGoals: SubGoal[];
    tools: Tool[];
}

export interface Employment {
    subGoal: SubGoal;
    strategy: Strategy;
    inputs: {
        [toolId: string]: {
            [inputSpecId: string]: Resource;
        };
    };
    // The keys of the outer object represent the tools in the strategy,
    // and the keys of the inner objects represent the inputSpecs for each tool.
    // NB: Only inputSpecs that are not produced as outputSpecs of other tools in the strategy are required.
}

// Disregard this for now
/* export type TagType = {
    alpha: AlphaValue;
    beta: BetaValue;
    gamma: GammaValue;
};

export type AlphaValue = "alpha1" | "alpha2" | "alpha3";
export type BetaValue = "beta1" | "beta2" | "beta3";
export type GammaValue = "gamma1" | "gamma2" | "gamma3"; */

export interface Resource extends Base {
    filetype: string;
    timestamp: string;
    generator: string;
    tags: {
        [key: string]: string; // We're using a simplified type for now
    }
    // tags?: Partial<TagType>; // Disregard this for now
}

// Disregard this for now
// Testing the Resource interface
/* const resource: Resource = {
    id: "res1",
    name: "some resource",
    description: "just testing",
    filetype: "json",
    generator: "system-x",
    timestamp: "2025-03-25T12:00:00Z",
    tags: {
        alpha: "alpha2",     // ✅ valid
        beta: "beta1",       // ✅ valid
        // @ts-expect-error;
        gamma: "oops",       // ❌ TypeScript complains!
    }
}; */

