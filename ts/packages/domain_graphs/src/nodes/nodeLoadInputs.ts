import { NodeSpec, BaseStateSpec, registerNode } from '../types.js';
import { chunkPDBContent, ChunkInfo } from '../tools/chunkPDBContent.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';


export const NodeLoadInputsState = Annotation.Root({
    anchor: Annotation<{ path: string, value: string }>(),
    target: Annotation<{ path: string, value: ChunkInfo[] }>(),
    box: Annotation<{ path: string, value: ChunkInfo[] }>(),
});

type WithBaseState = typeof NodeLoadInputsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeLoadInputs extends Runnable {

    static nodeSpec: NodeSpec = {
        description: '',
        operations: [
            {
                direction: 'read',
                storage: 'private',
                resources: [
                    { role: 'anchor', format: 'path' },
                    { role: 'target', format: 'path' },
                    { role: 'box', format: 'path' }
                ]
            },
            {
                direction: 'read',
                storage: 'shared',
                resources: [
                    { role: 'anchor', format: 'file' },
                    { role: 'target', format: 'file' },
                    { role: 'box', format: 'file' }
                ]
            },
            {
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

        if (state.dryRunModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                console.log('Connected to WebSocket server (DryRun)');
                ws.send(JSON.stringify({
                    node: 'NodeLoadInputs',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeLoadInputs completed in DryRun mode')],
            };
        }

        try {

            // Loading the inputs from SharedState into GraphState

            const inputs = [
                { key: 'anchor', path: state.anchor.path },
                { key: 'target', path: state.target.path },
                { key: 'box', path: state.box.path }
            ];

            const results: Record<string, any> = {};

            for (const { key, path } of inputs) {
                try {
                    const [content] = await storage
                        .bucket(bucketName)
                        .file(path)
                        .download();

                    if (key === 'target' || key === 'box') {
                        // Pre-process PDB content into chunks
                        const pdbContent = content.toString();
                        const chunks = chunkPDBContent(pdbContent);
                        results[key] = {
                            path,
                            value: chunks
                        };
                    } else {
                        // For SMILES content, keep as string
                        results[key] = {
                            path,
                            value: content.toString()
                        };
                    }
                } catch (downloadError: any) {
                    console.error(`Download error for ${key}:`, downloadError);
                    throw new Error(`Critical error while processing ${key}: ${downloadError.message}`);
                }
            }

            return {
                messages: [new AIMessage('NodeLoadInputs completed')],
                anchor: results.anchor,
                target: results.target,
                box: results.box,
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