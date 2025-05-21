import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

// === Base state spec ===

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    dryRunModeManager: Annotation<{
        dryRunMode: boolean;
        delay: number;
    }>(
        {
            reducer: (prev, next) => next,
            default: () => ({
                dryRunMode: false,
                delay: 0,
            }),
        }
    ),
};

// === Resource modeling ===

export type ResourceRole =
    | 'anchor'
    | 'target'
    | 'box'
    | 'candidate'
    | 'docking'
    | 'pose'
    | 'decision';

export type ResourceFormat = 'file' | 'path' | 'value';

export type Resource<
    Role extends ResourceRole = ResourceRole,
    Format extends ResourceFormat = ResourceFormat
> = {
    role: Role;
    format: Format;
};

// === Storage operations ===

export type StorageOperationDirectionType = 'read' | 'write';

/**
 * For private operations, `format: 'path'` and `format: 'value'` are allowed
 */
export type PrivateOperation = {
    direction: StorageOperationDirectionType;
    storage: 'private';
    resources: Resource<ResourceRole, 'path' | 'value'>[];
};

/**
 * For shared operations, only `format: 'file'` is allowed
 */
export type SharedOperation = {
    direction: StorageOperationDirectionType;
    storage: 'shared';
    resources: Resource<ResourceRole, 'file'>[];
};

/**
 * Union of valid storage operations
 */
export type StorageOperation = PrivateOperation | SharedOperation;

/**
 * A storage operation that is explicitly a write to private
 */
export type WritePrivateOperation = {
    direction: 'write';
    storage: 'private';
    resources: Resource<ResourceRole, 'path' | 'value'>[];
};

// === Tool invocation ===

export type ToolInvocation = {
    name: string;
    description: string;
    foo?: 'local' | 'internal' | 'external'; // ATTENTION
    inputs: Resource<ResourceRole, 'path' | 'value'>[]; // inputs to the tool
    outputs: Resource<ResourceRole, 'path' | 'value'>[]; // outputs from the tool
    operations: OperationDisallowPrivate[]; // tools cannot access private resources
};

// === Operation containers ===

export type OperationAllowPrivate = StorageOperation | ToolInvocation;
export type OperationDisallowPrivate = SharedOperation | ToolInvocation;

// === Node specification ===

/**
 * NodeSpec with a constraint: the final operation must be a write to private
 */
export type NodeSpec = { // ATTENTION: must be valid JSON
    name: ''; // Infered from the class name
    description: string;
    operations: [...OperationAllowPrivate[], WritePrivateOperation];
};

// === Node class type ===

export interface NodeClass {
    nodeSpec: NodeSpec;
}

// === Registration helper to attach spec ===

export function registerNode<
    T extends NodeClass & (new (...args: any[]) => any)
>(cls: T): T {
    /* const lastOp = cls.nodeSpec.operations.at(-1);
    if (
        !lastOp ||
        lastOp.direction !== 'write' ||
        lastOp.storage !== 'private'
    ) {
        throw new Error(`Node ${cls.name} must end with a write to private operation.`);
    } */
    return cls;
}


interface ConditionalEdge {
    name: string;
    source: string;
    targets: string[];
}

export type GraphSpec = {
    name: string;
    description: string;
    operation: WritePrivateOperation
    conditionalEdges: ConditionalEdge[];
}

export interface GraphClass {
    graphSpec: GraphSpec;
}

export const registerGraph = <T extends GraphClass>(cls: T): T => {
    return cls;
}


