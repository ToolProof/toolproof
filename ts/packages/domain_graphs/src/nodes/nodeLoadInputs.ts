import { Input, morphismRegistry } from '../types.js';
import { NodeSpec, BaseStateSpec, registerNode } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

export const NodeLoadInputsState = Annotation.Root({
    inputs: Annotation<Input[]>(),
});

type WithBaseState = typeof NodeLoadInputsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeLoadInputs extends Runnable {

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

        if (!state.dryRunModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    node: 'NodeLoadInputs',
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });
        }

        if (state.dryRunModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));

            return {
                messages: [new AIMessage('NodeLoadInputs completed in DryRun mode')],
            };
        }

        try {

            // Loading the inputs from SharedState into GraphState

            const inputs = [];

            for (const { path, morphism, value } of state.inputs) {

                try {
                    const [content] = await storage
                        .bucket(bucketName)
                        .file(path)
                        .download();

                    const contentStringified = content.toString()

                    const loader = morphismRegistry[morphism];
                    if (!loader) throw new Error(`Unknown morphism: ${morphism}`);

                    const fn = await loader(); // Load actual function
                    const value = await fn(contentStringified); // Call function

                    inputs.push({
                        path,
                        morphism,
                        value
                    });

                } catch (downloadError: any) {
                    throw new Error(`Error while processing: ${downloadError.message}`);
                }
            }

            return {
                messages: [new AIMessage('NodeLoadInputs completed')],
                inputs,
            };

        } catch (error: any) {
            console.error('Error in NodeLoadInputs:', error);
            return {
                messages: [new AIMessage('NodeLoadInputs failed')],
            };
        }

    }

}

export const NodeLoadInputs = registerNode<typeof _NodeLoadInputs>(_NodeLoadInputs);