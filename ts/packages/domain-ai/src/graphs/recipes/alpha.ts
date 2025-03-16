import { alpha } from "../../engine/recipes.js";
import { ToolMethods } from "../../engine/types.js";
import { AIMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { Storage } from '@google-cloud/storage';
import * as path from 'path';


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

            /* // Extract paths from the resources
            const payload = {
                lig_name: "imatinib", // Static for now
                lig_smiles_path: state.ligandCandidate.path,
                lig_box_path: state.box.path,
                rec_name: "1iep", // Static for now
                rec_no_lig_path: state.receptor.path,
            };

            console.log("Sending payload to /adv:", payload);

            // Call the Python /adv endpoint
            const response = await fetch('https://service-tp-tools-384484325421.europe-west2.run.app/adv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('response :', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json(); */

            // ATTENTION_RONAK: Here we must store the paths of the results in ligandDocking and ligandPose.
            // We'll use dummy values for the maps.
            return {
                messages: [new AIMessage("Docking completed successfully")],
                ligandDocking: { path: "", value: new Map() },
                ligandPose: { path: "", value: new Map() }
            };

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
    shouldRetry: Annotation<boolean>({
        reducer: (prev, next) => next
    })
});


const alphaClass = new AlphaClass();


const nodeLoadInputs = async (state: typeof GraphState.State) => {
    try {

        // ATTENTION_RONAK: Here we'll load the inputs from the bucket and into GraphState.

        return {
            messages: [new AIMessage("Inputs loaded successfully")],
            ligandAnchor: { path: "", value: "" },
            receptor: { path: "", value: new Map() },
            box: { path: "", value: new Map() }
        };

    } catch (error: any) {
        console.error("Error in nodeLoadInputs:", error);
        return {
            messages: [new AIMessage(`Error loading inputs: ${error.message}`)]
        };
    }
};


const nodeGenerateCandidate = async (state: typeof GraphState.State) => {

    // ATTENTION_RONAK: Here we'll generate the candidate and store it in GraphState.

    return {
        messages: [new AIMessage("Candidate loaded")],
        ligandCandidate: { path: "", value: "" }
    };
};


const nodeLoadResults = async (state: typeof GraphState.State) => {

    // ATTENTION_RONAK: Here we'll load the docking results from the bucket and into GraphState.

    return {
        messages: [new AIMessage("Results loaded")],
        ligandDocking: { ...state.ligandDocking, value: new Map() },
        ligandPose: { ...state.ligandPose, value: new Map() }
    };

};


const nodeEvaluateResults = async (state: typeof GraphState.State) => {

    // ATTENTION_RONAK: Here we'll evaluate the results and decide whether to retry or not.

    return {
        messages: [new AIMessage("Results evaluated")],
        shouldRetry: false
    };
};


const edgeShouldRetry = (state: typeof GraphState.State) => {
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


