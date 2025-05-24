import { morphismRegistry } from '../registries.js';
import { NodeSpec, BaseStateSpec, registerNode } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

// ATTENTION: can this be simplified?
type WithBaseState = ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeAlpha extends Runnable {

    spec: {
        inputKeys: string[];
    }

    constructor(spec: { inputKeys: string[]; }) {
        super();
        this.spec = spec;
    }

    static nodeSpec: NodeSpec = {
        description: '',
        operations: [
            {
                kind: 'StorageOperation',
                direction: 'read',
                storage: 'private',
                resources: [
                    { role: 'anchor', format: 'path' },
                    { role: 'target', format: 'path' },
                    { role: 'box', format: 'path' }
                ]
            },
            {
                kind: 'StorageOperation',
                direction: 'read',
                storage: 'shared',
                resources: [
                    { role: 'anchor', format: 'file' },
                    { role: 'target', format: 'file' },
                    { role: 'box', format: 'file' }
                ]
            },
            {
                kind: 'StorageOperation',
                direction: 'write',
                storage: 'private',
                resources: [
                    { role: 'anchor', format: 'value' },
                    { role: 'target', format: 'value' },
                    { role: 'box', format: 'value' }
                ]
            }
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        if (!state.dryModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    node: 'NodeAlpha',
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });
        }

        if (state.dryModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryModeManager.delay));

            return {
                messages: [new AIMessage('NodeAlpha completed in DryRun mode')],
            };
        }

        try {

            let resourceMap = state.resourceMap;

            for (const key of Object.keys(state.resourceMap)) {

                if (!this.spec.inputKeys.includes(key)) {
                    console.log('Skipping resource:', key);
                    continue;
                } else {
                    console.log('Processing resource:', key);
                }

                const resource = state.resourceMap[key];
                const path = resource.path;
                const morphism = resource.morphism;

                try {
                    const [content] = await storage
                        .bucket(bucketName)
                        .file(path)
                        .download();

                    const contentStringified = content.toString()

                    const loader = morphismRegistry[morphism as keyof typeof morphismRegistry]; // ATTENTION
                    if (!loader) throw new Error(`Unknown morphism: ${morphism}`);

                    const fn = await loader(); // Load actual function
                    const value = await fn(contentStringified); // Call function

                    resourceMap[key] = {
                        ...resource,
                        value,
                    }

                } catch (downloadError: any) {
                    throw new Error(`Error while processing: ${downloadError.message}`);
                }
            }

            return {
                messages: [new AIMessage('NodeAlpha completed')],
                resourceMap,
            };

        } catch (error: any) {
            console.error('Error in NodeAlpha:', error);
            return {
                messages: [new AIMessage('NodeAlpha failed')],
            };
        }

    }

}

export const NodeAlpha = registerNode<typeof _NodeAlpha>(_NodeAlpha);