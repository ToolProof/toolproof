import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { registerNode, BaseStateSpec } from "./nodeUtils.js";

const storage = new Storage({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GCP_PROJECT_ID,
    }
});
const bucketName = 'tp_resources';


export const NodeLoadResultsState = Annotation.Root({
    ligandDocking: Annotation<{ path: string, value: Map<string, any> }>({  // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDBQT row.
        reducer: (prev, next) => next
    }),
    ligandPose: Annotation<{ path: string, value: Map<string, any> }>({  // Key and value of map to be determined.
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeLoadResultsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeLoadResults extends Runnable {

    static specs = {
        description: "Load inputs from the bucket",
        resources: {
            inputSpecs: ["ligand", "receptor", "box"],
            outputSpecs: [],
        },
        state: NodeLoadResultsState,
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        // ATTENTION_RONAK: Here we'll load the docking results from the bucket and into GraphState.

        try {
            if (!state.ligandDocking?.path || !state.ligandPose?.path) {
                throw new Error("Missing ligandDocking or ligandPose paths");
            }

            const resources = [
                { key: 'ligandDocking', path: state.ligandDocking.path },
                { key: 'ligandPose', path: state.ligandPose.path }
            ];

            const results: Record<string, any> = {};

            for (const { key, path } of resources) {
                try {
                    // Remove any bucket prefix if present
                    const blobName = path
                        .replace('tp_resources/', '');

                    console.log(`Attempting to download ${bucketName}/${blobName}`);

                    const [content] = await storage
                        .bucket(bucketName)
                        .file(blobName)
                        .download();

                    // Create value map with content
                    const valueMap = new Map<string, any>();
                    valueMap.set('path', path);
                    valueMap.set('content', content.toString());

                    results[key] = {
                        path,
                        value: valueMap
                    };

                    console.log(`Successfully loaded ${key}`);
                } catch (downloadError: any) {
                    console.error(`Download error for ${key}:`, downloadError);
                    // Preserve the original path even if download fails
                    results[key] = {
                        path,
                        value: new Map([['path', path], ['error', downloadError.message]])
                    };
                }
            }

            return {
                messages: [new AIMessage("Results loaded")],
                ligandDocking: results.ligandDocking,
                ligandPose: results.ligandPose
            };
        } catch (error: any) {
            console.error("Error in nodeLoadResults:", error);
            return {
                messages: [new AIMessage(`Error loading results: ${error.message}`)]
            };
        }
    }

}

export const NodeLoadResults = registerNode<typeof NodeLoadResultsState, typeof _NodeLoadResults>(_NodeLoadResults);



