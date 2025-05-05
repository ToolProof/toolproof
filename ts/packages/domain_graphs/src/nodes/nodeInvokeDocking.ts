import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { AIMessage } from '@langchain/core/messages';
import { NodeSpec, BaseStateSpec, registerNode } from "./nodeUtils.js";
import * as path from 'path';
import axios from 'axios';

interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

export const NodeInvokeDockingState = Annotation.Root({
    candidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    target: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    box: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    docking: Annotation<{ path: string, value: Map<string, any> }>({  // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDBQT row.
        reducer: (prev, next) => next
    }),
    pose: Annotation<{ path: string, value: Map<string, any> }>({  // Key and value of map to be determined.
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeInvokeDockingState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


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
        ],
        nexts: ['NodeLoadResults'],
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {
            // Invoke docking and store the paths of the results in ligandDocking and ligandPose.

            // Ensure paths have the tp_resources/ prefix
            const addPrefix = (path: string) => {
                if (path.startsWith('tp_resources/')) return path;
                return `tp_resources/${path}`;
            };

            const ligandPath = addPrefix(state.candidate.path);
            const boxPath = addPrefix(state.box.path);
            const receptorPath = addPrefix(state.target.path);

            // Extract paths from the resources
            const payload = {
                lig_name: "imatinib", // Static for now
                ligand: ligandPath,
                box: boxPath,
                rec_name: "1iep", // Static for now
                receptor: receptorPath
            };

            console.log("Sending payload to /adv:", payload);

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
            console.log('result:', result);

            // Process actual results if available
            if (result?.result?.uploaded_files) {
                let ligandDockingPath = '';
                let ligandPosePath = '';

                // Process each uploaded file
                result.result.uploaded_files.forEach((filePath: string) => {
                    const fileName = path.basename(filePath);

                    // Determine file type based on extension
                    if (fileName.endsWith('.pdbqt') || fileName.endsWith('.pdb')) {
                        // This is the docking result file
                        ligandDockingPath = filePath;
                    } else if (fileName.endsWith('.sdf')) {
                        // This is the pose file
                        ligandPosePath = filePath;
                    }
                });

                if (!ligandDockingPath || !ligandPosePath) {
                    console.warn("Missing expected file types in response:", result.result.uploaded_files);
                }

                return {
                    messages: [new AIMessage("Docking completed successfully")],
                    docking: {
                        path: ligandDockingPath,
                        value: new Map()
                    },
                    pose: {
                        path: ligandPosePath,
                        value: new Map()
                    }
                };
            } else {
                throw new Error("No uploaded files in response");
            }

        } catch (error: any) {
            console.error("Error in nodeInvokeDocking:", error);
            return {
                messages: [new AIMessage(`Error invoking docking: ${error.message}`)]
            };
        }
    }

}

export const NodeInvokeDocking = registerNode<typeof _NodeInvokeDocking>(_NodeInvokeDocking);



