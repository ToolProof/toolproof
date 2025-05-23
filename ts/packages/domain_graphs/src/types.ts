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
    resourceMap: Annotation<ResourceMap>(),
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


import { ChunkInfo } from './tools/chunkPDBContent.js';

export const morphismRegistry2 = {
    abc: async () => {
        return (anchor: string, target: ChunkInfo[]) => {

            if (!anchor || !target || target.length === 0) {
                throw new Error('Missing required resources');
            }

            /* // Analyze chunks sequentially to maintain context
            let analysisContext = '';
            for (const chunk of targetChunks) {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are analyzing protein structure chunks to identify binding site characteristics. Focus on key residues and potential interaction points.'
                        },
                        {
                            role: 'user',
                            content: `
                                    Analyze the following protein chunk:
                                    Chain: ${chunk.chainId}
                                    Residues: ${chunk.startResidue}-${chunk.endResidue}
                                    
                                    Structure:
                                    ${chunk.content}
                                    
                                    Previous analysis context:
                                    ${analysisContext}
                                    
                                    Identify potential binding interactions and suggest suitable ligand modifications.
                                `
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                });

                analysisContext += '\n' + (response.choices[0].message.content?.trim() || '');
            }

            // Generate final candidate using accumulated analysis
            const finalResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate an optimized SMILES string for a new molecule that could bind effectively to the target based on ligand-receptor interactions.'
                    },
                    {
                        role: 'user',
                        content: `
                                Using this target protein analysis:
                                ${analysisContext}
        
                                And this anchor molecule SMILES:
                                ${anchor}
        
                                Generate an optimized candidate molecule using single SMILES string.
                                Respond with only the SMILES string.
                            `
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const candidate = finalResponse.choices[0].message.content?.trim(); */

            const candidate = anchor; // ATTENTION: placeholder for now

            return candidate;
        }
    },
    def: async () => {
        return (s: string) => 'Asdfgh! ' + s;
    },
} as const;


export type MorphismName2 = keyof typeof morphismRegistry2;


