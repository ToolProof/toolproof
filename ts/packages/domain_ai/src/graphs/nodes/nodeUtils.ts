import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Employment } from '../../engine/types';

export const BaseStateSpec = {
  ...MessagesAnnotation.spec,
  employment: Annotation<Employment>({
    reducer: (prev, next) => next,
  }),
};


export interface NodeSpecs<TState> {
    specs: {
        description: string;
        resources: {
            inputSpecs: string[];
            outputSpecs: string[];
        };
        state: TState;
    };
}


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


