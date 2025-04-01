import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { registerNode, BaseStateSpec } from "./nodeUtils.js";

// ATTENTION: factor out
const storage = new Storage({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GCP_PROJECT_ID,
    }
});
// ATTENTION: factor out to shared/src/constants.ts
const bucketName = 'tp_resources';

// ATTENTION: factor out to types.ts
interface ResourceData {
    description: string;
    filetype: string;
    generator: string;
    tags: {
        role?: string;
        type?: string;
    };
    name: string;
    timestamp: any;
}

// ATTENTION: factor out to types.ts
interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

// ATTENTION: factor out to utils.ts
const chunkPDBContent = (pdbContent: string, chunkSize: number = 1000): ChunkInfo[] => {
    const lines = pdbContent.split('\n');
    const chunks: ChunkInfo[] = [];
    let currentChunk: string[] = [];
    let currentChainId = '';
    let startResidue = -1;
    let currentResidue = -1;

    for (const line of lines) {
        if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
            const chainId = line.substring(21, 22).trim();
            const residueNumber = parseInt(line.substring(22, 26).trim());

            // Start new chunk if conditions met
            if (currentChunk.length >= chunkSize ||
                (currentChainId && chainId !== currentChainId)) {

                if (currentChunk.length > 0) {
                    chunks.push({
                        chainId: currentChainId,
                        startResidue: startResidue,
                        endResidue: currentResidue,
                        content: currentChunk.join('\n')
                    });
                }
                currentChunk = [];
                startResidue = residueNumber;
            }

            if (startResidue === -1) {
                startResidue = residueNumber;
            }

            currentChainId = chainId;
            currentResidue = residueNumber;
            currentChunk.push(line);
        }
    }

    // Add the last chunk if not empty
    if (currentChunk.length > 0) {
        chunks.push({
            chainId: currentChainId,
            startResidue: startResidue,
            endResidue: currentResidue,
            content: currentChunk.join('\n')
        });
    }

    return chunks;
};


const NodeLoadInputsState_I = Annotation.Root({
});

const NodeLoadInputsState_O = Annotation.Root({
    ligandAnchor: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    receptor: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    box: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
});


export const NodeLoadInputsState = Annotation.Root({
    ...NodeLoadInputsState_I.spec,
    ...NodeLoadInputsState_O.spec,
});

type WithBaseState = typeof NodeLoadInputsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeLoadInputs extends Runnable {

    static meta = {
        description: "Load inputs from the bucket",
        stateSpecs: {
            inputs: NodeLoadInputsState_I,
            outputs: NodeLoadInputsState_O,
        },
        resourceSpecs: {
            inputs: ["ligand", "receptor", "box"],
            outputs: [],
        },
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {

            // Here we load the inputs from the bucket and into GraphState.

            // Get input references
            const inputs = state.employment.inputs || {};

            // Handle nested structure - find the first key that contains the resources
            let ligandRef: any, receptorRef: any, boxRef: any;

            // Check if inputs has a nested structure
            const firstKey = Object.keys(inputs)[0];
            if (firstKey && typeof inputs[firstKey] === 'object' && inputs[firstKey].ligand) {
                // Nested structure case
                ligandRef = inputs[firstKey].ligand;
                receptorRef = inputs[firstKey].receptor;
                boxRef = inputs[firstKey].box;
            } else {
                // Direct structure case
                ligandRef = inputs.ligand;
                receptorRef = inputs.receptor;
                boxRef = inputs.box;
            }

            if (!ligandRef || !receptorRef || !boxRef) {
                throw new Error("Missing required resource references");
            }

            // Fetch resources in parallel
            const [ligandSnap, receptorSnap, boxSnap] = await Promise.all([
                ligandRef.get(),
                receptorRef.get(),
                boxRef.get()
            ]);

            // Extract resource data
            const ligandData = ligandSnap.exists ? ligandSnap.data() as ResourceData : null;
            const receptorData = receptorSnap.exists ? receptorSnap.data() as ResourceData : null;
            const boxData = boxSnap.exists ? boxSnap.data() as ResourceData : null;

            if (!ligandData || !receptorData || !boxData) {
                throw new Error("One or more required resources not found");
            }

            const ligandPath = `${bucketName}/${ligandSnap.id}.${ligandData.filetype}`;
            const receptorPath = `${bucketName}/${receptorSnap.id}.${receptorData.filetype}`;
            const boxPath = `${bucketName}/${boxSnap.id}.${boxData.filetype}`;

            console.log("Resource paths:", { ligandPath, receptorPath, boxPath });

            const resources = [
                { key: 'ligandAnchor', path: ligandPath },
                { key: 'receptor', path: receptorPath },
                { key: 'box', path: boxPath }
            ];

            const results: Record<string, any> = {};

            for (const { key, path } of resources) {
                try {
                    // Try both tp_resources and tp-data formats
                    const blobName = path
                        .replace('tp_resources/', '');

                    console.log(`Attempting download from ${bucketName}/${blobName}`);

                    const [content] = await storage
                        .bucket(bucketName)
                        .file(blobName)
                        .download();

                    if (key === 'receptor' || key === 'box') {
                        // Pre-process PDB content into chunks
                        const pdbContent = content.toString();
                        const chunks = chunkPDBContent(pdbContent);
                        results[key] = {
                            path,
                            value: chunks
                        };
                    } else {
                        // For other resources, keep as string
                        results[key] = {
                            path,
                            value: content.toString()
                        };
                    }

                    console.log(`Successfully downloaded ${key} resource`);
                } catch (downloadError: any) {
                    console.error(`Download error for ${key}:`, downloadError);
                    results[key] = {
                        path,
                        value: `Error downloading: ${downloadError.message}`
                    };
                }
            }

            return {
                messages: [new AIMessage("Inputs loaded successfully")],
                ligandAnchor: results.ligandAnchor,
                receptor: results.receptor,
                box: results.box,
            };

        } catch (error: any) {
            console.error("Error in nodeLoadInputs:", error);
            return {
                messages: [new AIMessage(`Error loading inputs: ${error.message}`)]
            };
        }
    }

}

export const NodeLoadInputs = registerNode<typeof NodeLoadInputsState_I | typeof NodeLoadInputsState_O, typeof _NodeLoadInputs>(_NodeLoadInputs);



