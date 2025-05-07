import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { NodeSpec, BaseStateSpec, registerNode } from './nodeUtils.js';

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


export const NodeLoadInputsState = Annotation.Root({
    anchor: Annotation<{ path: string, value: string }>(),
    target: Annotation<{ path: string, value: ChunkInfo[] }>(),
    box: Annotation<{ path: string, value: ChunkInfo[] }>(),
});

type WithBaseState = typeof NodeLoadInputsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeLoadInputs extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeLoadInputs',
        description: '',
        operations: [
            {
                direction: 'read',
                storage: 'private',
                resources: [
                    { name: 'anchor', kind: 'path' },
                    { name: 'target', kind: 'path' },
                    { name: 'box', kind: 'path' }
                ]
            },
            {
                direction: 'read',
                storage: 'shared',
                resources: [
                    { name: 'anchor', kind: 'file' },
                    { name: 'target', kind: 'file' },
                    { name: 'box', kind: 'file' }
                ]
            },
            {
                direction: 'write',
                storage: 'private',
                resources: [
                    { name: 'anchor', kind: 'value' },
                    { name: 'target', kind: 'value' },
                    { name: 'box', kind: 'value' }
                ]
            }
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {

            // Here we load the inputs from the bucket and into GraphState.

            const resources = [
                { key: 'anchor', path: state.anchor.path },
                { key: 'target', path: state.target.path },
                { key: 'box', path: state.box.path }
            ];

            const results: Record<string, any> = {};

            for (const { key, path } of resources) {
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
                messages: [new AIMessage('Inputs loaded successfully')],
                anchor: results.anchor,
                target: results.target,
                box: results.box,
            };

        } catch (error: any) {
            console.error('Error in nodeLoadInputs:', error);
            return {
                messages: [new AIMessage(`Error loading inputs: ${error.message}`)]
            };
        }
    }

}

export const NodeLoadInputs = registerNode<typeof _NodeLoadInputs>(_NodeLoadInputs);