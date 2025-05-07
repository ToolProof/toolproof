import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import { AIMessage } from '@langchain/core/messages';
import { registerNode, BaseStateSpec } from "./nodeUtils.js";
import { z } from "zod";
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import { zodResponseFormat } from "openai/helpers/zod";

const storage = new Storage({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GCP_PROJECT_ID,
    }
});
const bucketName = 'tp_resources';

const openai = new OpenAI();

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

interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

// Helper function to generate PDB format for the box
const generateBoxPDB = (boxCoords: any): string => {
    const { center_x, center_y, center_z, size_x, size_y, size_z } = boxCoords;

    // Calculate corner points
    const halfX = size_x / 2;
    const halfY = size_y / 2;
    const halfZ = size_z / 2;

    // Generate PDB format with 8 corner points and connecting lines
    let pdbContent = "HEADER    DOCKING BOX\n";

    // Add 8 corner points as atoms
    const corners = [
        [center_x - halfX, center_y - halfY, center_z - halfZ],
        [center_x + halfX, center_y - halfY, center_z - halfZ],
        [center_x + halfX, center_y + halfY, center_z - halfZ],
        [center_x - halfX, center_y + halfY, center_z - halfZ],
        [center_x - halfX, center_y - halfY, center_z + halfZ],
        [center_x + halfX, center_y - halfY, center_z + halfZ],
        [center_x + halfX, center_y + halfY, center_z + halfZ],
        [center_x - halfX, center_y + halfY, center_z + halfZ]
    ];

    corners.forEach((corner, i) => {
        pdbContent += `ATOM  ${(i + 1).toString().padStart(5)} ${' C  '.padEnd(4)}BOX A${(i + 1).toString().padStart(4)}    ${corner[0].toFixed(3).padStart(8)}${corner[1].toFixed(3).padStart(8)}${corner[2].toFixed(3).padStart(8)}  1.00  0.00           C\n`;
    });

    // Add connecting lines as CONECT records
    pdbContent += "CONECT    1    2    4    5\n";
    pdbContent += "CONECT    2    1    3    6\n";
    pdbContent += "CONECT    3    2    4    7\n";
    pdbContent += "CONECT    4    1    3    8\n";
    pdbContent += "CONECT    5    1    6    8\n";
    pdbContent += "CONECT    6    2    5    7\n";
    pdbContent += "CONECT    7    3    6    8\n";
    pdbContent += "CONECT    8    4    5    7\n";
    pdbContent += "END\n";

    return pdbContent;
};

export const NodeGenerateBoxState_I = Annotation.Root({
    receptor: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
    ligandCandidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
});

export const NodeGenerateBoxState_O = Annotation.Root({
    box: Annotation<{ path: string, value: ChunkInfo[] }>({ // Store pre-processed chunks
        reducer: (prev, next) => next
    }),
});

export const NodeGenerateBoxState = Annotation.Root({
    ...NodeGenerateBoxState_I.spec,
    ...NodeGenerateBoxState_O.spec,
});

type WithBaseState = typeof NodeGenerateBoxState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeGenerateBox extends Runnable {

    static meta = {
        description: "Generate the box.",
        stateSpecs: {
            inputs: NodeGenerateBoxState_I,
            outputs: NodeGenerateBoxState_O,
        },
        resourceSpecs: {
            inputs: [],
            outputs: [],
        },
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        try {
            const candidateSmiles: string = state.ligandCandidate.value;
            const targetChunks: ChunkInfo[] = state.receptor.value;

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
                ligandBox: {
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

export const NodeGenerateBox = registerNode<typeof NodeGenerateBoxState_I | typeof NodeGenerateBoxState_O, typeof _NodeGenerateBox>(_NodeGenerateBox);



