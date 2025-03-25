

interface Base {
    id: string;
    name: string;
    description: string;
}

export interface SubGoal extends Base { }

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
    tags: Map<string, string>;
}

export interface Employment {
    subGoal: SubGoal;
    strategy: Strategy;
    inputs: Map<string, Map<string, Resource>>;
    // Maps each tool to its inputSpecs and their filepaths. 
    // The keys of the outer map represent the tools of the strategy, 
    // while the keys of the inner map represent the inputSpecs of that tool. 
    // NB: only inputSpecs that are not produced as outputSpecs of other tools of the strategy are required.
}

