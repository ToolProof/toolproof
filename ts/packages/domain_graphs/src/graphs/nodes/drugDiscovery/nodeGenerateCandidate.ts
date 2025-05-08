import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import { FieldValue } from 'firebase-admin/firestore';
import { db } from "../../../../firebaseAdminInit.js";
import { NodeSpec, BaseStateSpec, registerNode } from "../../types.js";

const storage = new Storage({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GCP_PROJECT_ID,
    }
});
const bucketName = 'tp_resources';

const openai = new OpenAI();

interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

export const NodeGenerateCandidateState = Annotation.Root({
    anchor: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    target: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    candidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeGenerateCandidateState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeGenerateCandidate extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeGenerateCandidate',
        description: '',
        operations: [
            {
                direction: 'read',
                storage: 'private',
                resources: [
                    { name: 'anchor', kind: 'value' },
                    { name: 'target', kind: 'value' },
                ],
            },
            {
                name: 'OpenAI',
                description: '',
                inputs: [
                    { name: 'anchor', kind: 'value' },
                    { name: 'target', kind: 'value' },
                ],
                outputs: [
                    { name: 'candidate', kind: 'value' },
                ],
                operations: [],
            },
            {
                direction: 'write',
                storage: 'shared',
                resources: [
                    { name: 'candidate', kind: 'file' },
                ],
            },
            {
                direction: 'write',
                storage: 'private',
                resources: [
                    { name: 'candidate', kind: 'path' },
                    { name: 'candidate', kind: 'value' }, // Not strictly neccessary, but useful for subsequent iterations
                ],
            },
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        try {
            const anchorContent: string = state.anchor.value;
            const targetChunks: ChunkInfo[] = state.target.value;

            console.log('anchorContent:', anchorContent);

            if (!anchorContent || !targetChunks || targetChunks.length === 0) {
                throw new Error("Missing required resources");
            }

            // Analyze chunks sequentially to maintain context
            let analysisContext = '';
            for (const chunk of targetChunks) {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are analyzing protein structure chunks to identify binding site characteristics. Focus on key residues and potential interaction points."
                        },
                        {
                            role: "user",
                            content: `
                                    Analyze the following protein chunk:
                                    Chain: ${chunk.chainId}
                                    Residues: ${chunk.startResidue}-${chunk.endResidue}
                                    
                                    Structure:
                                    ${chunk.content}
                                    
                                    Previous analysis context:
                                    ${analysisContext}
                                    
                                    Identify potential binding interactions and suggest suitable ligand modifications.
                                `
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                });

                analysisContext += '\n' + (response.choices[0].message.content?.trim() || '');
            }

            // Generate final candidate using accumulated analysis
            const finalResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Generate an optimized / perfect SMILES string for a new molecule that could bind effectively to the target based on protein-ligand interactions."
                    },
                    {
                        role: "user",
                        content: `
                                Using this protein analysis:
                                ${analysisContext}
        
                                And this anchor molecule SMILES:
                                ${anchorContent}
        
                                Generate a perfect candidate molecule using single SMILES string.
                                Respond with only the SMILES string.
                            `
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const candidateSmiles = finalResponse.choices[0].message.content?.trim();
            console.log('Generated candidate SMILES:', candidateSmiles);

            if (!candidateSmiles) {
                throw new Error("Failed to generate candidate SMILES string");
            }

            // Create Firestore document for the candidate in resources collection
            const timestamp = new Date().toISOString();

            try {
                // First create the document in Firestore
                const resourcesRef = db.collection("resources");
                const candidateDoc = resourcesRef.doc(); // Auto-generate document ID

                await candidateDoc.set({
                    "name": "imatinib",
                    "description": "Generated candidate molecule",
                    "filetype": "txt",
                    "generator": "alpha",
                    "tags": {
                        "type": "ligand",
                        "role": "candidate",
                    },
                    "timestamp": FieldValue.serverTimestamp(),
                });

                // Get the document ID
                const docId = candidateDoc.id;

                // Save candidate to GCS using the document ID
                const candidateFileName = `${docId}.txt`;

                await storage
                    .bucket(bucketName)
                    .file(candidateFileName)
                    .save(candidateSmiles, {
                        contentType: 'text/plain',
                        metadata: {
                            createdAt: timestamp,
                            type: 'candidate',
                            sourceAnchor: state.anchor.path,
                            firestoreDocId: docId
                        }
                    });

                console.log(`Candidate saved to gs://tp_resources/${candidateFileName} with Firestore ID: ${docId}`);

                return {
                    messages: [new AIMessage("Candidate generated")],
                    candidate: {
                        path: candidateFileName,
                        value: candidateSmiles,
                    }
                };

            } catch (error: any) {
                console.error('Error saving candidate:', error);
                throw new Error(`Failed to save candidate: ${error.message}`);
            }

        } catch (error: any) {
            console.error("Error in nodeGenerateCandidate:", error);
            return {
                messages: [new AIMessage(`Error generating candidate: ${error.message}`)]
            };
        }
    }

}

export const NodeGenerateCandidate = registerNode<typeof _NodeGenerateCandidate>(_NodeGenerateCandidate);



