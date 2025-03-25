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

export interface Resource extends Base {
    filetype: string;
    generator: string;
    timestamp: string;
    tags: { [key: string]: string };
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
