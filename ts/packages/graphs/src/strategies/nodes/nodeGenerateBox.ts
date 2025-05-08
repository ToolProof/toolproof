import { NodeSpec, BaseStateSpec, registerNode } from './nodeUtils.js';
import { ChunkInfo } from 'src/localTools/chunkPDBContent.js';
import { generateBoxPDB } from 'src/localTools/foo.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { AIMessage } from '@langchain/core/messages';
import { z } from "zod";
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

export const NodeGenerateBoxState = Annotation.Root({
    candidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    target: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    box: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeGenerateBoxState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeGenerateBox extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeGenerateBox',
        description: '',
        operations: [],
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {
            const candidateSmiles: string = state.candidate.value;
            const targetChunks: ChunkInfo[] = state.target.value;

            if (!candidateSmiles || !targetChunks || targetChunks.length === 0) {
                throw new Error("Missing candidate SMILES or receptor data");
            }

            // Prepare target information for the prompt
            const targetSummary = targetChunks.map(chunk =>
                `Chain ${chunk.chainId}: Residues ${chunk.startResidue}-${chunk.endResidue}`
            ).join('\n');

            // Use zod for response formatting
            const BoxSchema = z.object({
                boxCoordinates: z.object({
                    center_x: z.number(),
                    center_y: z.number(),
                    center_z: z.number(),
                    size_x: z.number(),
                    size_y: z.number(),
                    size_z: z.number()
                }),
                bindingSiteResidues: z.array(z.object({
                    chainId: z.string(),
                    residueNumber: z.number(),
                    residueName: z.string()
                }))
            });

            const response = await openai.beta.chat.completions.parse({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Generate a docking box for the candidate molecule and target protein. The box should encompass the binding site."
                    },
                    {
                        role: "user",
                        content: `
                                Candidate SMILES: ${candidateSmiles}
                                
                                Target protein information:
                                ${targetSummary}
                                
                                Based on the protein structure and candidate molecule, define:
                                1. A docking box with center coordinates (x,y,z) and dimensions
                                2. Key binding site residues that should be included in the box
                            `
                    }
                ],
                response_format: zodResponseFormat(BoxSchema, "box_generator")
            });

            const parsedResponse = response.choices[0].message.parsed;

            if (!parsedResponse) {
                throw new Error("Failed to parse box generation response");
            }

            // Generate PDB-format box representation
            const boxPDB = generateBoxPDB(parsedResponse.boxCoordinates);

            // Save box to GCS
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const boxFileName = `boxes/box_${timestamp}.pdb`;

            // await storage
            //     .bucket(bucketNameData)
            //     .file(boxFileName)
            //     .save(boxPDB, {
            //         contentType: 'text/plain',
            //         metadata: {
            //             createdAt: timestamp,
            //             type: 'box',
            //             candidateSource: state.ligandCandidate.path
            //         }
            //     });

            // console.log(`Box saved to gs://tp_data/${boxFileName}`);

            return {
                messages: [new AIMessage("Docking box generated")],
                box: {
                    path: boxFileName,
                    value: boxPDB
                }
            };

        } catch (error: any) {
            console.error("Error in nodeGenerateBox:", error);
            return {
                messages: [new AIMessage(`Error generating box: ${error.message}`)]
            };
        }
    }

}

export const NodeGenerateBox = registerNode<typeof _NodeGenerateBox>(_NodeGenerateBox);



