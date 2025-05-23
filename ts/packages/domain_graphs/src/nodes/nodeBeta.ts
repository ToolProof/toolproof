import { NodeSpec, BaseStateSpec, registerNode, morphismRegistry2, MorphismName2 } from '../types.js';
import { ChunkInfo } from '../tools/chunkPDBContent.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import WebSocket from 'ws';

const openai = new OpenAI();

type WithBaseState = ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeBeta extends Runnable {

    spec: {
        inputKeys: string[];
        outputKeys: string[];
        morphism: MorphismName2;
    }

    constructor(spec: { inputKeys: string[], outputKeys: string[], morphism: MorphismName2; }) {
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
                    { role: 'anchor', format: 'value' },
                    { role: 'target', format: 'value' },
                ],
            },
            {
                kind: 'ToolInvocation',
                name: 'OpenAI',
                description: '',
                inputs: [
                    { role: 'anchor', format: 'value' },
                    { role: 'target', format: 'value' },
                ],
                outputs: [
                    { role: 'candidate', format: 'value' },
                ],
                operations: [],
            },
            {
                kind: 'StorageOperation',
                direction: 'write',
                storage: 'shared',
                resources: [
                    { role: 'candidate', format: 'file' },
                ],
            },
            {
                kind: 'StorageOperation',
                direction: 'write',
                storage: 'private',
                resources: [
                    { role: 'candidate', format: 'path' },
                    { role: 'candidate', format: 'value' }, // Not strictly neccessary, but useful for subsequent iterations
                ],
            },
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        if (!state.dryModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    node: 'NodeBeta',
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
                messages: [new AIMessage('NodeBeta completed in DryRun mode')],
            };
        }

        try {

            // Continue from here
            // Need to look up the resources to pass from this.spec.inputKeys
            // And the name and storage path of what's returned from this.spec.outputKeys

            const loader = morphismRegistry2[this.spec.morphism];
            if (!loader) throw new Error(`Unknown morphism: ${this.spec.morphism}`);

            const fn = await loader(); // Load actual function
            const value = await fn(); // Call function

            // Create Firestore document for the candidate in resources collection
            const timestamp = new Date().toISOString();

            try {

                const firstTwoSegmentsOfAnchorPath = state.anchor.path.split('/').slice(0, 2).join('/');
                const filePath = `${firstTwoSegmentsOfAnchorPath}/${timestamp}/candidate.smi`;

                // Save the candidate to Google Cloud Storage
                await storage
                    .bucket(bucketName)
                    .file(filePath)
                    .save(candidate, {
                        contentType: 'text/plain',
                        metadata: {
                            createdAt: timestamp,
                        }
                    });

                return {
                    messages: [new AIMessage('NodeBeta completed')],
                    candidate: {
                        path: filePath,
                        value: candidate,
                    }
                };

            } catch (error: any) {
                console.error('Error saving candidate:', error);
                throw new Error(`Failed to save candidate: ${error.message}`);
            }

        } catch (error: any) {
            console.error('Error in NodeBeta:', error);
            return {
                messages: [new AIMessage('NodeBeta failed')],
            };
        }

    }

}

export const NodeBeta = registerNode<typeof _NodeBeta>(_NodeBeta);



