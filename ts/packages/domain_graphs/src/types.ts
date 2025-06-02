import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Runnable } from '@langchain/core/runnables';

export type Resource = {
    path: string;
    value: any; // ATTENTION
}

export type ResourceMap = {
    [key: string]: Resource;
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

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

}