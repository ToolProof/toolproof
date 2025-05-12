import { NodeSpec, BaseStateSpec, registerNode } from 'src/graphs/types.js';
import { storage, bucketName } from 'src/firebaseAdminInit.js'
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';


export const NodeLoadResultsState = Annotation.Root({
    docking: Annotation<{ path: string, value: Map<string, any> }>(),
    pose: Annotation<{ path: string, value: Map<string, any> }>(),
});

type WithBaseState = typeof NodeLoadResultsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeLoadResults extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeLoadResults',
        description: '',
        operations: [
            {
                direction: 'write',
                storage: 'private',
                resources: [],
            },
        ],
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        if (state.isDryRun) {
            return {
                messages: [new AIMessage('NodeLoadResults completed in DryRun mode')],
            };
        }

        // Here we load the docking results from the bucket and into GraphState.

        try {
            if (!state.docking?.path || !state.pose?.path) {
                throw new Error('Missing docking or pose paths');
            }

            const resources = [
                { key: 'docking', path: state.docking.path },
                { key: 'pose', path: state.pose.path }
            ];

            const results: Record<string, any> = {};

            for (const { key, path } of resources) {
                try {
                    // Remove any bucket prefix if present
                    const blobName = path
                        .replace('tp_resources/', '');

                    console.log(`Attempting to download ${bucketName}/${blobName}`);

                    const [content] = await storage
                        .bucket(bucketName)
                        .file(blobName)
                        .download();

                    // Create value map with content
                    const valueMap = new Map<string, any>();
                    valueMap.set('path', path);
                    valueMap.set('content', content.toString());

                    results[key] = {
                        path,
                        value: valueMap
                    };

                    console.log(`Successfully loaded ${key}`);
                } catch (downloadError: any) {
                    console.error(`Download error for ${key}:`, downloadError);
                    // Preserve the original path even if download fails
                    results[key] = {
                        path,
                        value: new Map([['path', path], ['error', downloadError.message]])
                    };
                }
            }

            return {
                messages: [new AIMessage('NodeLoadResults completed')],
                docking: results.docking,
                pose: results.pose
            };
        } catch (error: any) {
            console.error('Error in NodeLoadResults:', error);
            return {
                messages: [new AIMessage('NodeLoadResults failed')],
            };
        }
    }

}

export const NodeLoadResults = registerNode<typeof _NodeLoadResults>(_NodeLoadResults);



