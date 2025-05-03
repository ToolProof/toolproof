
export { };


type ResourceType = 'anchor' | 'target' | 'candidate' | 'results' | 'decision';

type DirectionType = 'read' | 'write';

type StorageType = 'private' | 'shared';

type StorageOperation = {
    direction: DirectionType;
    resources: ResourceType[];
}

interface StorageOperationAllowPrivate extends StorageOperation {
    storage: StorageType;
}

interface StorageOperationDisallowPrivate extends StorageOperation {
    storage: 'shared';
}

type ToolInvocation = {
    name: string; // ATTENTION: tool name
    operations: OperationDisallowPrivate[];
}

type SwapOperation = {
    inputs: ResourceType[];
    outputs: ResourceType[];
}

type OperationAllowPrivate = StorageOperationAllowPrivate | ToolInvocation | SwapOperation;

type OperationDisallowPrivate = StorageOperationDisallowPrivate | ToolInvocation | SwapOperation;;

interface NodeSpec {
    name: string;
    description: string;
    operations: OperationAllowPrivate[];
    nexts: string[];
}

interface Strategy {
    nodes: NodeSpec[];
}

const strategy: Strategy = {
    nodes: [
        {
            name: 'LoadInputs',
            description: '',
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
            operations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['anchor', 'target']
                },
                {
                    name: 'OpenAI-1',
                    operations: [
                        {
                            inputs: ['anchor', 'target'],
                            outputs: ['candidate']
                        }
                    ],
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
            operations: [
                {
                    name: 'SchrodingerSuite',
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
            operations: [
                {
                    direction: 'read',
                    storage: 'private',
                    resources: ['results']
                },
                {
                    name: 'OpenAI-2',
                    operations: [
                        {
                            inputs: ['results'],
                            outputs: ['decision']
                        }
                    ],
                },
                {
                    direction: 'write',
                    storage: 'private',
                    resources: ['decision']
                },
            ],
            nexts: ['GenerateCandidate', 'END']
        }
    ]
}
