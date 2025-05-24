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
        outputPath: string;
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

            const foo = async (url: string, inputKeys: string[], outputPath: string): Promise<{ [key: string]: string }> => {
                // Here we must invoke the service at the given URL
                // This function cannot know about anything specific to Ligandokreado
                // spec must specify all neccessary parameters
                // Maybe the tool only needs to return the output keys...

                // Extract paths from the resources
                const payload = { // ATTENTION: consider changing the payload structure in the tool instead of relying on complex keys
                    ligand: `${bucketName}/${state.candidate.path}`,
                    receptor: `${bucketName}/${state.target.path}`,
                    box: `${bucketName}/${state.box.path}`,
                };

                // Create a new Map to store the results

                const response = await axios.post(
                    'https://service-tp-tools-384484325421.europe-west2.run.app/autodock_basic',
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 30 * 60 * 1000, // 30 minutes in milliseconds
                    }
                );

                const result = response.data;
                // console.log('result:', result);

                // Process actual results if available
                if (result?.result?.uploaded_files) {
                    let dockingPath = '';
                    let posePath = '';

                    // Process each uploaded file
                    result.result.uploaded_files.forEach((filePath: string) => {
                        const fileName = path.basename(filePath);

                        // Determine file type based on extension
                        if (fileName.endsWith('.pdbqt') || fileName.endsWith('.pdb')) {
                            // This is the docking result file
                            dockingPath = filePath;
                        } else if (fileName.endsWith('.sdf')) {
                            // This is the pose file
                            posePath = filePath;
                        }
                    });

                    if (!dockingPath || !posePath) {
                        console.warn('Missing expected file types in response:', result.result.uploaded_files);
                    }

                }
                return { outputKey: 'outputPath' };
            }

            const paths = await foo(
                this.spec.url,
                this.spec.inputKeys,
                this.spec.outputPath
            );

            const extraResources: ResourceMap = Object.keys(paths).reduce((acc, key) => {
                acc[key] = {
                    path: paths[key],
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



