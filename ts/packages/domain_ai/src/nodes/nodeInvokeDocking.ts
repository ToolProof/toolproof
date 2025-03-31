import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { registerNode, BaseStateSpec } from "./nodeUtils.js";
import * as path from 'path';
import axios from 'axios';

interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}


export const NodeInvokeDockingState = Annotation.Root({
    ligandCandidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    receptor: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    box: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeInvokeDockingState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeInvokeDocking extends Runnable {

    static specs = {
        description: "Load inputs from the bucket",
        resources: {
            inputSpecs: ["ligand", "receptor", "box"],
            outputSpecs: [],
        },
        state: NodeInvokeDockingState,
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {
            // ATTENTION_RONAK: Here we must store the paths of the results in ligandDocking and ligandPose.

            // Ensure paths have the tp_resources/ prefix
            const addPrefix = (path: string) => {
                if (path.startsWith('tp_resources/')) return path;
                return `tp_resources/${path}`;
            };

            const ligandPath = addPrefix(state.ligandCandidate.path);
            const boxPath = addPrefix(state.box.path);
            const receptorPath = addPrefix(state.receptor.path);

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
                    ligandDocking: {
                        path: ligandDockingPath,
                        value: new Map()
                    },
                    ligandPose: {
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

export const NodeInvokeDocking = registerNode<typeof NodeInvokeDockingState, typeof _NodeInvokeDocking>(_NodeInvokeDocking);



