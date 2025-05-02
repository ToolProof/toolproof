
type DirectionType = 'read' | 'write';
type StorageType = 'private' | 'shared';

type ResourceType = 'anchor' | 'target' | 'candidate' | 'results' | 'desicion';

interface ResourceOperation {
    direction: DirectionType;
    resources: ResourceType[];
}

interface ResourceOperationGraphNode extends ResourceOperation {
    storage: StorageType;
}

interface ResourceOperationToolNode extends ResourceOperation {
    storage: 'shared';
}

interface Strategy {
    nodes: GraphNode[];
}

interface GenericNode {
    name: string;
    description: string;
}

interface GraphNode extends GenericNode {
    tool: ToolNode | null;
    resourceOperations: ResourceOperationGraphNode[];
    nexts: string[];
}

interface ToolNode extends GenericNode {
    resourceOperations: ResourceOperationToolNode[];
}


const strategy: Strategy = {
    nodes: [
        {
            name: 'LoadInputs',
            description: '',
            tool: null,
            resourceOperations: [
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
            tool: {
                name: 'OpenAI-1',
                description: '',
                resourceOperations: []
            },
            resourceOperations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['anchor', 'target']
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
            tool: {
                name: 'SchrodingerSuite',
                description: '',
                resourceOperations: [
                    {
                        direction: 'read',
                        storage: 'shared',
                        resources: ['candidate', 'target']
                    },
                    {
                        direction: 'write',
                        storage: 'shared',
                        resources: ['results']
                    }
                ],
            },
            resourceOperations: [],
            nexts: ['LoadResults']
        },
        {
            name: 'LoadResults',
            description: '',
            tool: null,
            resourceOperations: [
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
            tool: {
                name: 'OpenAI-2',
                description: '',
                resourceOperations: []
            },
            resourceOperations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['results']
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
