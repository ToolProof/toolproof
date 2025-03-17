import { alpha } from "../../engine/recipes.js";
import { ToolMethods } from "../../engine/types.js";
import { AIMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import axios from 'axios';
import { OpenAI } from 'openai';

const openai = new OpenAI();


const storage = new Storage({
    keyFilename: path.join(process.cwd(), 'gcp-key.json'),
});
const bucketName = 'tp_data';

// Define the AlphaInterface
interface AlphaInterface extends ToolMethods<typeof alpha["recipeSpecs"][string]["tools"], typeof GraphState.State> { }

// Implement the interface in a class
export class AlphaClass extends Runnable implements AlphaInterface {

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: typeof GraphState.State, options?: Partial<RunnableConfig<Record<string, any>>>) {
        return this.autodock(state);
    }

    async autodock(state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> {
        try {
            // ATTENTION_RONAK: Here we must store the paths of the results in ligandDocking and ligandPose.

            // Ensure paths have the tp_data/ prefix
            const addPrefix = (path: string) => {
                if (path.startsWith('tp_data/')) return path;
                if (path.startsWith('tp-data/')) return path.replace('tp-data/', 'tp_data/');
                return `tp_data/${path}`;
            };
            
            const ligSmilesPath = addPrefix(state.ligandCandidate.path);
            const ligBoxPath = addPrefix(state.box.path);
            const recNoLigPath = addPrefix(state.receptor.path);

            // Extract paths from the resources
            const payload = {
                lig_name: "imatinib", // Static for now
                lig_smiles_path: ligSmilesPath,
                lig_box_path: ligBoxPath,
                rec_name: "1iep", // Static for now
                rec_no_lig_path: recNoLigPath
            };

            console.log("Sending payload to /adv:", payload);

            // Create a new Map to store the results

            const response = await axios.post(
                'https://service-tp-tools-384484325421.europe-west2.run.app/adv',
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
    };
}


const GraphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    ligandAnchor: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    ligandCandidate: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    receptor: Annotation<{ path: string, value: Map<string, any> }>({ // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDB row.
        reducer: (prev, next) => next
    }),
    box: Annotation<{ path: string, value: Map<string, any> }>({ // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDB row.
        reducer: (prev, next) => next
    }),
    ligandDocking: Annotation<{ path: string, value: Map<string, any> }>({  // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDBQT row.
        reducer: (prev, next) => next
    }),
    ligandPose: Annotation<{ path: string, value: Map<string, any> }>({  // Key and value of map to be determined.
        reducer: (prev, next) => next
    }),
    evaluation: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    shouldRetry: Annotation<boolean>({
        reducer: (prev, next) => next
    })
});


const alphaClass = new AlphaClass();


const nodeLoadInputs = async (state: typeof GraphState.State) => {
    try {

        // ATTENTION_RONAK: Here we'll load the inputs from the bucket and into GraphState.

        console.log('state :', state);
        const resources = [
            { key: 'ligandAnchor', path: state.ligandAnchor.path },
            { key: 'receptor', path: state.receptor.path },
            { key: 'box', path: state.box.path }
        ];

        const results: Record<string, any> = {};

        for (const { key, path } of resources) {
            try {
                // Try both tp_data and tp-data formats
                const blobName = path
                    .replace('tp_data/', '')
                    .replace('tp-data/', '');
                
                console.log(`Attempting download from ${bucketName}/${blobName}`);
                
                const [content] = await storage
                    .bucket(bucketName)
                    .file(blobName)
                    .download();
                
                results[key] = {
                    path,
                    value: content.toString()
                };
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
};

interface ChunkInfo {
    chainId: string;
    startResidue: number;
    endResidue: number;
    content: string;
}

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

const nodeGenerateCandidate = async (state: typeof GraphState.State) => {
    // ATTENTION_RONAK: Here we'll generate the candidate and store it in GraphState.
    try {
        const anchorContent: string = state.ligandAnchor.value;
        const targetContent: any = state.receptor.value;

        console.log('anchorContent:', anchorContent);

        if (!anchorContent || !targetContent) {
            throw new Error("Missing required resources");
        }
        const chunks = chunkPDBContent(targetContent);
        
        // Analyze chunks sequentially to maintain context
        let analysisContext = '';
        for (const chunk of chunks) {
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

        // Save candidate to GCS
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const candidateFileName = `candidates/candidate_${timestamp}.txt`;
        
        try {
            await storage
                .bucket(bucketName)
                .file(candidateFileName)
                .save(candidateSmiles, {
                    contentType: 'text/plain',
                    metadata: {
                        createdAt: timestamp,
                        type: 'candidate',
                        sourceAnchor: state.ligandAnchor.path
                    }
                });

            console.log(`Candidate saved to gs://tp_data/${candidateFileName}`);

            return { 
                messages: [new AIMessage("Candidate generated")],
                ligandCandidate: {
                    path: candidateFileName,
                    value: candidateSmiles,
                }
            };

        } catch (storageError: any) {
            console.error('Error saving candidate to storage:', storageError);
            throw new Error(`Failed to save candidate: ${storageError.message}`);
        }

    } catch (error: any) {
        console.error("Error in nodeGenerateCandidate:", error);
        return {
            messages: [new AIMessage(`Error generating candidate: ${error.message}`)]
        };
    }
};


const nodeLoadResults = async (state: typeof GraphState.State) => {
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
                    .replace('tp_data/', '')
                    .replace('tp-data/', '');
                
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
};


const nodeEvaluateResults = async (state: typeof GraphState.State) => {
    // ATTENTION_RONAK: Here we'll evaluate the results and decide whether to retry or not.
    try {
        if (!state.ligandDocking?.value || !state.ligandPose?.value) {
            throw new Error("Missing ligandDocking or ligandPose data");
        }

        // Prepare the results content for OpenAI evaluation
        let resultsContent = "";
        
        const dockingContent = state.ligandDocking.value.get('content');
        const poseContent = state.ligandPose.value.get('content');
        
        if (dockingContent) {
            resultsContent += `Docking Result:\n${dockingContent}\n\n`;
        }
        
        if (poseContent) {
            resultsContent += `Pose Result:\n${poseContent}\n\n`;
        }

        // Evaluate results using OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Analyze the docking results and provide a detailed evaluation. Focus on binding affinity, interactions, and potential improvements."
                },
                {
                    role: "user",
                    content: `Please analyze these docking results:\n${resultsContent}`
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        const evaluation = response.choices[0].message.content?.trim();
        if (!evaluation) {
            throw new Error("Failed to generate evaluation");
        }

        // Save evaluation to GCS
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const evaluationFileName = `evaluations/evaluation_${timestamp}.txt`;
        
        await storage
            .bucket(bucketName)
            .file(evaluationFileName)
            .save(evaluation, {
                contentType: 'text/plain',
                metadata: {
                    createdAt: timestamp,
                    type: 'evaluation'
                }
            });

        console.log(`Evaluation saved to gs://tp_data/${evaluationFileName}`);


        return {
            messages: [new AIMessage("Results evaluated")],
            shouldRetry: false,
            evaluation: {
                path: evaluationFileName,
                value: evaluation
            }
        };

    } catch (error: any) {
        console.error("Error in nodeEvaluateResults:", error);
        return {
            messages: [new AIMessage(`Error evaluating results: ${error.message}`)],
            shouldRetry: false
        };
    }
};


const edgeShouldRetry = (state: typeof GraphState.State) => {
    console.log('state :', state);
    if (state.shouldRetry) {
        return 'nodeGenerateCandidate';
    } else {
        return END;
    }
};


const stateGraph = new StateGraph(GraphState)
    .addNode("nodeLoadInputs", nodeLoadInputs)
    .addNode("nodeGenerateCandidate", nodeGenerateCandidate)
    .addNode("nodeInvokeDocking", alphaClass)
    .addNode("nodeLoadResults", nodeLoadResults)
    .addNode("nodeEvaluateResults", nodeEvaluateResults)
    .addEdge(START, "nodeLoadInputs")
    .addEdge("nodeLoadInputs", "nodeGenerateCandidate")
    .addEdge("nodeGenerateCandidate", "nodeInvokeDocking")
    .addEdge("nodeInvokeDocking", "nodeLoadResults")
    .addEdge("nodeLoadResults", "nodeEvaluateResults")
    .addConditionalEdges("nodeEvaluateResults", edgeShouldRetry);


export const alphaGraph = stateGraph.compile();


