import { interMorphismRegistry } from '../registries.js';
import { NodeSpec, BaseStateSpec, registerNode } from '../types.js';
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
        outputKey: string;
        intraMorphism: string; // ATTENTION: should be packed with the outputKey
        outputDir: string;
        interMorphism: string;
    }

    constructor(spec: { inputKeys: string[], outputKey: string, intraMorphism: string, outputDir: string, interMorphism: string }) {
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

            const inputs: any[] = [];

            Object.entries(state.resourceMap).forEach(([key, resource]) => {
                if (this.spec.inputKeys.includes(key)) {
                    inputs.push(resource.value);
                }
            });

            const loader = interMorphismRegistry[this.spec.interMorphism as keyof typeof interMorphismRegistry];
            if (!loader) throw new Error(`Unknown morphism: ${this.spec.interMorphism}`);

            const fn = await loader() as (...args: any[]) => string;
            const value = await fn(...inputs); // ATTENTION: is the type misleading?

            const timestamp = new Date().toISOString();
            const outputPath = `${this.spec.outputDir}/${timestamp}/${this.spec.outputKey}`;
            // ATTENTION: nodeBeta should be passed a piece of logic that generates outputPath, or generate the timestamp callside
            // ATTENTION: use join path

            try {

                await storage
                    .bucket(bucketName)
                    .file(outputPath)
                    .save(value, {
                        contentType: 'text/plain',
                        metadata: {
                            createdAt: timestamp,
                        }
                    });

                return {
                    messages: [new AIMessage('NodeBeta completed')],
                    resourceMap: {
                        ...state.resourceMap,
                        [this.spec.outputKey]: {
                            path: `${outputPath}/${this.spec.outputKey}`,
                            intraMorphism: this.spec.intraMorphism,
                            value: value,
                        },
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



