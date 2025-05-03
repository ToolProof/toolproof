import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Employment } from '../engine/types';

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    employment: Annotation<Employment>({
        reducer: (prev, next) => next,
    }),
};

type ResourceType = 'anchor' | 'target' | 'candidate' | 'results' | 'decision';

type StorageOperationDirectionType = 'read' | 'write';

type StorageOperationNatureType = 'alpha' | 'beta';

type StorageOperation = {
    direction: StorageOperationDirectionType;
    resources: ResourceType[];
}

interface Gamma_AlphaBeta extends StorageOperation {
    storage: StorageOperationNatureType;
}

interface Delta_Alpha extends StorageOperation {
    storage: 'alpha'; // ATTENTION: must document this
}
// What about naming the operations after the visualization?
type ToolOperation = {
    name: string; // ATTENTION: tool name
    operations: OperationDisallowPrivate[];
}

type SwapOperation = {
    inputs: ResourceType[];
    outputs: ResourceType[];
}

type OperationAllowPrivate = Gamma_AlphaBeta | ToolOperation | SwapOperation;

type OperationDisallowPrivate = Delta_Alpha | ToolOperation | SwapOperation;

export interface NodeSpec {
    name: string;
    description: string;
    operations: OperationAllowPrivate[];
    nexts: string[];
}

interface NodeClass {
    nodeSpec: NodeSpec;
}


// ATTENTION_RONAK: The purpose of this is to enforce the contract of nodeSpecs in the node class
export function registerNode<
    T extends NodeClass & (new (...args: any[]) => any)
>(cls: T): T {
    return cls;
}