import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Employment } from '../engine/types';

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    employment: Annotation<Employment>({
        reducer: (prev, next) => next,
    }),
};

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

type OperationDisallowPrivate = StorageOperationDisallowPrivate | ToolInvocation | SwapOperation;

export interface NodeSpecs {
    name: string;
    description: string;
    operations: OperationAllowPrivate[];
    nexts: string[];
}

interface NodeClass {
    nodeSpecs: NodeSpecs;
}


// ATTENTION_RONAK: The purpose of this is to enforce the contract of nodeSpecs in the node class
export function registerNode<
    T extends NodeClass & (new (...args: any[]) => any)
>(cls: T): T {
    return cls;
}