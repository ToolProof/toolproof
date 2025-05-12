import { NodeSpec, BaseStateSpec, registerNode } from 'src/graphs/types.js';
import { ChunkInfo } from 'src/localTools/chunkPDBContent';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import * as path from 'path';
import axios from 'axios';


export const NodeInvokeDockingState = Annotation.Root({
    candidate: Annotation<{ path: string, value: string }>(),
    target: Annotation<{ path: string, value: ChunkInfo[] }>(),
    box: Annotation<{ path: string, value: ChunkInfo[] }>(),
    docking: Annotation<{ path: string, value: Map<string, any> }>(),
    pose: Annotation<{ path: string, value: Map<string, any> }>(),
});

type WithBaseState = typeof NodeInvokeDockingState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeInvokeDocking extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeInvokeDocking',
        description: '',
        operations: [
            {
                name: 'SchrödingerWrapper',
                description: '',
                inputs: [
                    { name: 'candidate', kind: 'path' },
                    { name: 'target', kind: 'path' },
                ],
                outputs: [
                    { name: 'docking', kind: 'path' },
                    { name: 'pose', kind: 'path' },
                ],
                operations: [
                    {
                        direction: 'read',
                        storage: 'shared',
                        resources: [
                            { name: 'candidate', kind: 'file' },
                            { name: 'target', kind: 'file' },
                        ],
                    },
                    {
                        direction: 'write',
                        storage: 'shared',
                        resources: [
                            { name: 'docking', kind: 'file' },
                            { name: 'pose', kind: 'file' },
                        ],
                    },
                ],
            },
            {
                direction: 'write',
                storage: 'private',
                resources: [
                    { name: 'docking', kind: 'path' },
                    { name: 'pose', kind: 'path' },
                ],
            },
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        if (state.isDryRun) {
            return {
                messages: [new AIMessage('NodeInvokeDocking completed in DryRun mode')],
            };
        }


        try {

            // Extract paths from the resources
            const payload = {
                ligand: state.candidate.path,
                receptor: state.target.path,
                box: state.box.path,
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

                return {
                    messages: [new AIMessage('NodeInvokeDocking completed')],
                    docking: {
                        path: dockingPath,
                        value: new Map()
                    },
                    pose: {
                        path: posePath,
                        value: new Map()
                    }
                };
            } else {
                throw new Error('No uploaded files in response');
            }

        } catch (error: any) {
            console.error('Error in NodeInvokeDocking:', error);
            return {
                messages: [new AIMessage('NodeInvokeDocking failed')],
            };
        }
    }

}

export const NodeInvokeDocking = registerNode<typeof _NodeInvokeDocking>(_NodeInvokeDocking);



