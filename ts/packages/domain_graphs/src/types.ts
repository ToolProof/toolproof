import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

// === Base state spec ===

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    dryModeManager: Annotation<{
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

export type Resource2<
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
    resources: Resource2<ResourceRole, 'path' | 'value'>[];
};

/**
 * For shared operations, only `format: 'file'` is allowed
 */
export type SharedStorageOperation = BaseStorageOperation & {
    storage: 'shared';
    resources: Resource2<ResourceRole, 'file'>[];
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
    resources: Resource2<ResourceRole, 'path' | 'value'>[];
};

// === Tool invocation ===

export type ToolInvocation = {
    kind: 'ToolInvocation';
    name: string;
    description: string;
    deployment?: 'local' | 'internal' | 'external'; // ATTENTION: to be implemented
    inputs: Resource2<ResourceRole, 'path' | 'value'>[];
    outputs: Resource2<ResourceRole, 'path' | 'value'>[];
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


export const morphismRegistry = {
    doNothing: async () => {
        return (s: string) => 'Hallelujah! ' + s;
    },
    chunkPDBContent: async () => {
        const { chunkPDBContent } = await import('./tools/chunkPDBContent.js');
        return chunkPDBContent; // assume: (s: string) => ChunkInfo[]
    },
} as const;

export type MorphismName = keyof typeof morphismRegistry;

// Extracts the resolved return type of a loader (i.e. the function returned)
type LoadedFunction<M extends MorphismName> = Awaited<ReturnType<typeof morphismRegistry[M]>>;

// Extracts the final return value of calling the loaded function
type MorphismOutput<M extends MorphismName> = Awaited<ReturnType<LoadedFunction<M>>>;

// The full output map
export type MorphismOutputTypes = {
    [M in MorphismName]: MorphismOutput<M>
};

export type Resource<M extends MorphismName = MorphismName> = {
    path: string;
    morphism: M;
    value: MorphismOutputTypes[M];
};

// Can be used instead of Resource to get narrowing based on the morphism
/* type ResourceUnion = {
    [M in MorphismName]: Resource<M>
}[MorphismName]; */

export type ResourceMap = {
    [key: string]: Resource;
}


