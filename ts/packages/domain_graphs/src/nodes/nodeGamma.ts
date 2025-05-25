import { NodeSpec, BaseStateSpec, registerNode, ResourceMap } from '../types.js';
import { bucketName } from '../firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import * as path from 'path';
import axios from 'axios';
import WebSocket from 'ws';


type WithBaseState = ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeGamma extends Runnable {

    spec: {
        url: string;
        inputKeys: string[];
        outputPath: string; // ATTENTION: should be named outputDir for consistency
    }

    constructor(spec: { url: string, inputKeys: string[], outputPath: string; }) {
        super();
        this.spec = spec;
    }

    static nodeSpec: NodeSpec = {
        description: '',
        operations: [
            {
                kind: 'ToolInvocation',
                name: 'AutoDockWrapper',
                description: '',
                inputs: [
                    { role: 'candidate', format: 'path' },
                    { role: 'target', format: 'path' },
                ],
                outputs: [
                    { role: 'docking', format: 'path' },
                    { role: 'pose', format: 'path' },
                ],
                operations: [
                    {
                        kind: 'StorageOperation',
                        direction: 'read',
                        storage: 'shared',
                        resources: [
                            { role: 'candidate', format: 'file' },
                            { role: 'target', format: 'file' },
                        ],
                    },
                    {
                        kind: 'StorageOperation',
                        direction: 'write',
                        storage: 'shared',
                        resources: [
                            { role: 'docking', format: 'file' },
                            { role: 'pose', format: 'file' },
                        ],
                    },
                ],
            },
            {
                kind: 'StorageOperation',
                direction: 'write',
                storage: 'private',
                resources: [
                    { role: 'docking', format: 'path' },
                    { role: 'pose', format: 'path' },
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
                    node: 'NodeGamma',
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
                messages: [new AIMessage('NodeGamma completed in DryRun mode')],
            };
        }

        try {

            const foo = async (url: string, inputKeys: string[], outputPath: string): Promise<string[]> => {
                // Here we must invoke the service at the given URL
                // This function cannot know about anything specific to Ligandokreado
                // spec must specify all neccessary parameters
                // Maybe the tool only needs to return the output keys...

                const payload: { [key: string]: string } = {};

                inputKeys.forEach((key) => {
                    payload[key] = `${bucketName}/${state.resourceMap[key].path}`;
                });

                console.log('payload:', JSON.stringify(payload, null, 2));

                const response = await axios.post(
                    url,
                    {
                        ...payload,
                        outputPath: `${bucketName}/${outputPath}`,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 30 * 60 * 1000, // 30 minutes in milliseconds
                    }
                );

                const result = response.data;

                // console.log('result:', result);

                return result.result.outputKeys;
            }

            const outputKeys = await foo(
                this.spec.url,
                this.spec.inputKeys,
                this.spec.outputPath
            );

            const extraResources: ResourceMap = outputKeys.reduce((acc, key) => {
                acc[key] = {
                    path: path.join(this.spec.outputPath, key),
                    intraMorphism: '', // ATTENTION: must be set here so that NodeAlpha can use it
                    value: null,
                };
                return acc;
            }, {} as ResourceMap);

            return {
                messages: [new AIMessage('NodeGamma completed')],
                resourceMap: {
                    ...state.resourceMap,
                    ...extraResources,
                }
            };

        } catch (error: any) {
            console.error('Error in NodeGamma:', error);
            return {
                messages: [new AIMessage('NodeGamma failed')],
            };
        }
    }

}

export const NodeGamma = registerNode<typeof _NodeGamma>(_NodeGamma);



