

type DirectionType = 'read' | 'write';
type StorageType = 'shared' | 'private';

type ResourceType = 'anchor' | 'target' | 'candidate' | 'results' | 'desicion';

interface ResourceAccess {
    direction: DirectionType;
    storage: StorageType;
    resources: ResourceType[];
}

interface ResourceExchange {
    inputs: ResourceType[];
    outputs: ResourceType[];
}

type Operation = ResourceAccess | ResourceExchange;

interface Strategy {
    nodes: GraphNode[];
}

interface GraphNode {
    name: string;
    description: string;
    tool: string | null;
    operations: Operation[];
    nexts: string[];
}

/* interface ToolNode {
    name: string;
    Node: string;
    inputs: string[];
    outputs: string[];
} */


const strategy: Strategy = {
    nodes: [
        {
            name: 'LoadInputs',
            description: '',
            tool: null,
            operations: [
                {
                    direction: 'read',
                    storage: 'shared',
                    resources: ['anchor', 'target']
                },
                {
                    direction: 'write',
                    storage: 'private',
                    resources: ['anchor', 'target']
                }
            ],
            nexts: ['GenerateCandidate']
        },
        {
            name: 'GenerateCandidate',
            description: '',
            tool: 'OpenAI-1',
            operations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['anchor', 'target']
                },
                {
                    inputs: ['anchor', 'target'],
                    outputs: ['candidate']
                },
                {
                    direction: 'write',
                    storage: 'private',
                    resources: ['candidate']
                },
                {
                    direction: 'write',
                    storage: 'shared',
                    resources: ['candidate']
                }
            ],
            nexts: ['InvokeDocking']
        },
        {
            name: 'InvokeDocking',
            description: '',
            tool: 'SchrodingerSuite',
            operations: [
                {
                    direction: 'read',
                    storage: 'shared',
                    resources: ['candidate', 'target']
                },
                {
                    inputs: ['candidate', 'target'],
                    outputs: ['results'] // ATTENTION: is this accurate?
                },
                {
                    direction: 'write',
                    storage: 'shared',
                    resources: ['results']
                }
            ],
            nexts: ['LoadResults']
        },
        {
            name: 'LoadResults',
            description: '',
            tool: null,
            operations: [
                {
                    direction: 'read',
                    storage: 'shared',
                    resources: ['results']
                },
                {
                    direction: 'write',
                    storage: 'private',
                    resources: ['results']
                }
            ],
            nexts: ['EvaluateResults']
        },
        {
            name: 'EvaluateResults',
            description: '',
            tool: 'OpenAI-2',
            operations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['results']
                },
                {
                    inputs: ['results'],
                    outputs: ['desicion']
                },
                {
                    direction: 'write',
                    storage: 'private',
                    resources: ['desicion']
                },
            ],
            nexts: ['GenerateCandidate', 'END']
        }
    ]
}
