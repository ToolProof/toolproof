import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { Runnable } from '@langchain/core/runnables';

export type Resource = {
    path: string;
    intraMorphism: string;
    value: any; // ATTENTION
}

type MetaResource = string | number | boolean | null;

export type ResourceMap = {
    [key: string]: Resource;
}

export type MetaResourceMap = {
    [key: string]: MetaResource;
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
    metaResourceMap: Annotation<MetaResourceMap>(),
});

export type GraphState = typeof GraphStateAnnotationRoot.State;

export abstract class NodeBase<TSpec> extends Runnable {

    abstract spec: TSpec;

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

}