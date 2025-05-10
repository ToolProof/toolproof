import { NodeSpec, BaseStateSpec, registerNode } from 'src/graphs/types.js';
import { ChunkInfo } from 'src/localTools/chunkPDBContent';
import { storage, bucketName } from 'src/firebaseAdminInit.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead

const openai = new OpenAI();

export const NodeGenerateCandidateState = Annotation.Root({
    anchor: Annotation<{ path: string, value: string }>(),
    target: Annotation<{ path: string, value: ChunkInfo[] }>(),
    candidate: Annotation<{ path: string, value: string }>(),
});

type WithBaseState = typeof NodeGenerateCandidateState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


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

        if (state.isDryRun) {
            return {
                messages: [new AIMessage('NodeGenerateCandidate completed in DryRun mode')],
            };
        }

        try {
            /* const anchorContent: string = state.anchor.value;
            const targetChunks: ChunkInfo[] = state.target.value;
 
            console.log('anchorContent:', anchorContent);
 
            if (!anchorContent || !targetChunks || targetChunks.length === 0) {
                throw new Error('Missing required resources');
            }
 
            // Analyze chunks sequentially to maintain context
            let analysisContext = '';
            for (const chunk of targetChunks) {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are analyzing protein structure chunks to identify binding site characteristics. Focus on key residues and potential interaction points.'
                        },
                        {
                            role: 'user',
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
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate an optimized / perfect SMILES string for a new molecule that could bind effectively to the target based on protein-ligand interactions.'
                    },
                    {
                        role: 'user',
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
            }); */

            // const candidate = finalResponse.choices[0].message.content?.trim();
            const candidate = 'Hi, how are you?'; // ATTENTION: Placeholder for the actual candidate generation logic
            console.log('Generated candidate SMILES:', candidate);

            if (!candidate) {
                throw new Error('Failed to generate candidate SMILES string');
            }

            // Create Firestore document for the candidate in resources collection
            const timestamp = new Date().toISOString();

            try {

                // Save candidate to GCS using the document ID
                const fileName = `adb/${timestamp}/candidate.smi`;

                await storage
                    .bucket(bucketName)
                    .file(fileName)
                    .save(candidate, {
                        contentType: 'text/plain',
                        metadata: {
                            createdAt: timestamp,
                        }
                    });

                console.log(`Candidate saved to gs://tp_resources/${fileName}`);

                return {
                    messages: [new AIMessage('NodeGenerateCandidate completed')],
                    candidate: {
                        path: fileName,
                        value: candidate,
                    }
                };

            } catch (error: any) {
                console.error('Error saving candidate:', error);
                throw new Error(`Failed to save candidate: ${error.message}`);
            }

        } catch (error: any) {
            console.error('Error in NodeGenerateCandidate:', error);
            return {
                messages: [new AIMessage('NodeGenerateCandidate failed')],
            };
        }

    }

}

export const NodeGenerateCandidate = registerNode<typeof _NodeGenerateCandidate>(_NodeGenerateCandidate);



