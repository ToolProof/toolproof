import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Employment } from '../engine/types';

export const BaseStateSpec = {
    ...MessagesAnnotation.spec,
    employment: Annotation<Employment>({
        reducer: (prev, next) => next,
    }),
};


export interface NodeSpecs<TState> {
    meta: {
        description: string;
        stateSpecs: {
            inputs: TState;
            outputs: TState;
        };
        resourceSpecs: {
            inputs: string[];
            outputs: string[];
        };
    };
}

// ATTENTION_RONAK: The purpose of this is to enforce the contract of specs in the node class
export function registerNode<
    TState,
    T extends NodeSpecs<TState> & (new (...args: any[]) => any)
>(cls: T): T {
    /* const s = cls.specs;

    if (!Array.isArray(s.resources?.inputSpecs) || !Array.isArray(s.resources?.outputSpecs)) {
        throw new Error(`Node ${cls.name} is missing required resource specs`);
    } */

    return cls;
}


