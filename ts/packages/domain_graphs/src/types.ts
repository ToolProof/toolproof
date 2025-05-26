import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Runnable } from '@langchain/core/runnables';

type Resource = {
    path: string;
    intraMorphism: string;
    value: any; // ATTENTION
}

export type ResourceMap = {
    [key: string]: Resource; // ATTENTION_1: union type
}

export const GraphStateAnnotationRoot = Annotation.Root({
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
});

export type GraphState = typeof GraphStateAnnotationRoot.State;

export abstract class NodeBase<TSpec> extends Runnable {

    abstract spec: TSpec;

}