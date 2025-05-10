import { MessagesAnnotation } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';

// === Base state spec ===

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    isDryRun: Annotation<boolean>(),
};

// === Resource modeling ===

export type ResourceType =
    | 'anchor'
    | 'target'
    | 'box'
    | 'candidate'
    | 'docking'
    | 'pose'
    | 'decision';

export type ResourceKind = 'file' | 'path' | 'value';

export type ResourceRef<
    Name extends ResourceType = ResourceType,
    Kind extends ResourceKind = ResourceKind
> = {
    name: Name;
    kind: Kind;
};

// === Storage operations ===

export type StorageOperationDirectionType = 'read' | 'write';

/**
 * For private operations, `kind: 'path'` and `kind: 'value'` are allowed
 */
export type PrivateOperation = {
    direction: StorageOperationDirectionType;
    storage: 'private';
    resources: ResourceRef<ResourceType, 'path' | 'value'>[];
};

/**
 * For shared operations, only `kind: 'file'` is allowed
 */
export type SharedOperation = {
    direction: StorageOperationDirectionType;
    storage: 'shared';
    resources: ResourceRef<ResourceType, 'file'>[];
};

/**
 * Union of all valid storage operations
 */
export type StorageOperation = PrivateOperation | SharedOperation;

/**
 * A storage operation that is explicitly a write to private
 */
export type WritePrivateOperation = {
    direction: 'write';
    storage: 'private';
    resources: ResourceRef<ResourceType, 'path' | 'value'>[];
};

// === Tool invocation ===

export type ToolInvocation = {
    name: string;
    description: string;
    foo?: 'internal' | 'external'; // ATTENTION
    inputs: ResourceRef<ResourceType, 'path' | 'value'>[]; // inputs to the tool
    outputs: ResourceRef<ResourceType, 'path' | 'value'>[]; // outputs from the tool
    operations: OperationDisallowPrivate[]; // tools must not access private resources
};

// === Operation containers ===

export type OperationAllowPrivate = StorageOperation | ToolInvocation;
export type OperationDisallowPrivate = SharedOperation | ToolInvocation;

// === Node specification ===

/**
 * NodeSpec with a constraint: the final operation must be a write to private
 */
export type NodeSpec = {
    name: string;
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


