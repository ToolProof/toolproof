

export interface SubGoal {
    name: string;
    description: string;
}

export interface Tool {
    name: string;
    description: string;
    inputs: string[];
    outputs: string[];
}

export interface Recipe {
    name: string;
    description: string;
    subGoals: SubGoal[];
    tools: Tool[];
}


// Define interface for application data
export interface ApplicationData {
    recipe: Recipe;
    subGoal: SubGoal;
    inputs: {
        [key: string]: { // Enumerates each tool in the recipe
            [key: string]: string; // Enumerates each input for the respective tool
        };
    };
}