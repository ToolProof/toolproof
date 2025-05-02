
export { };

type DirectionType = 'read' | 'write';
type StorageType = 'private' | 'shared';

type ResourceType = 'anchor' | 'target' | 'candidate' | 'results' | 'desicion';

type ResourceOperation = {
    direction: DirectionType;
    resources: ResourceType[];
}

type ToolInvocation = {
    operations: OperationDisallowPrivate[];
}

interface ResourceOperationAllowPrivate extends ResourceOperation {
    storage: StorageType;
}

interface ResourceOperationDisallowPrivate extends ResourceOperation {
    storage: 'shared';
}

type OperationAllowPrivate = ResourceOperationAllowPrivate | ToolInvocation;

type OperationDisallowPrivate = ResourceOperationDisallowPrivate | ToolInvocation;

interface Strategy {
    nodes: Node[];
}

interface Node {
    name: string;
    description: string;
    tool: string | null;
    operations: OperationAllowPrivate[];
    nexts: string[];
}


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
                    operations: [],
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
                    operations: [
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
                    operations: [],
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
