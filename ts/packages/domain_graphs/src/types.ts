import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

// === Base state spec ===

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    dryRunModeManager: Annotation<{
        dryRunMode: boolean;
        delay: number;
        drySocketMode: boolean;
    }>(
        {
            reducer: (prev, next) => next,
            default: () => ({
                dryRunMode: false,
                delay: 0,
                drySocketMode: false,
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


type BaseStorageOperation = {
    kind: 'StorageOperation';
    direction: StorageOperationDirectionType;
}

/**
 * For private operations, `format: 'path'` and `format: 'value'` are allowed
 */
export type PrivateStorageOperation = BaseStorageOperation & {
    storage: 'private';
    resources: Resource<ResourceRole, 'path' | 'value'>[];
};

/**
 * For shared operations, only `format: 'file'` is allowed
 */
export type SharedStorageOperation = BaseStorageOperation & {
    storage: 'shared';
    resources: Resource<ResourceRole, 'file'>[];
};

/**
 * Union of valid storage operations
 */
export type StorageOperation = PrivateStorageOperation | SharedStorageOperation;

/**
 * A storage operation that is explicitly a write to private
 */
export type WritePrivateOperation = {
    kind: 'StorageOperation';
    direction: 'write';
    storage: 'private';
    resources: Resource<ResourceRole, 'path' | 'value'>[];
};

// === Tool invocation ===

export type ToolInvocation = {
    kind: 'ToolInvocation';
    name: string;
    description: string;
    deployment?: 'local' | 'internal' | 'external'; // ATTENTION: to be implemented
    inputs: Resource<ResourceRole, 'path' | 'value'>[];
    outputs: Resource<ResourceRole, 'path' | 'value'>[];
    operations: OperationDisallowPrivate[]; // tools cannot access private resources
};

// === Operation containers ===

export type OperationAllowPrivate = StorageOperation | ToolInvocation;
export type OperationDisallowPrivate = SharedStorageOperation | ToolInvocation;

// === Node specification ===

/**
 * NodeSpec with a constraint: the final operation must be a write to private
 */
export type NodeSpec = { // ATTENTION: must be valid JSON
    // name: ''; // Infered from the class name and added dynamically
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


