import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { Storage } from '@google-cloud/storage';
import * as path from 'path';


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    // ATTENTION_RONAK: Since the autodock workflow now has its own graph, we can have custom state properties instead of just "resources". The key of all outer maps will always be a string holding the respective filepath (possibly a folderpath for results).
    anchor: Annotation<Map<string, string>>({ // The value parameter should be a string, or preferably a stricter type that represents a subset of strings. Ideally, it should be a type that represents SMILES strings (if that's possible).
        reducer: (prev, next) => next
    }),
    target: Annotation<Map<string, Map<string, PDBRowType>>>({ // The value parameter of the outer map should be a map that can hold PDB data. The key of this inner map should be a string (holding a "row_identifier") and the value should be a custom data type that represents a PDB row.
        reducer: (prev, next) => next
    }),
    box: Annotation<Map<string, Map<string, PDBRowType>>>({ // Same as target
        reducer: (prev, next) => next
    }),
    results: Annotation<Map<string, Map<string, ResultType>>>({  // The value parameter of the outer map should be a map that can hold results data. The key of this inner map should be a string (holding a "result_identifier") and the value should be a custom data type (probably a union type!) that represents a result.
        reducer: (prev, next) => next
    }),
    shouldRetry: Annotation<boolean>({
        reducer: (prev, next) => next
    })
});


const storage = new Storage({
    keyFilename: path.join(process.cwd(), 'gcp-key.json'),
});


const nodeLoadResources = async (state: typeof State.State) => {
    try {
        const resourcesMap = new Map<string, Map<string, string>>();

        for (const tool of state.direction.tools) {

            if (!tool.resources) {
                console.warn(`No resources found for tool ${tool.name}`);
                continue;
            }

            const toolResources = new Map<string, string>();

            for (const [role, resource] of Object.entries(tool.resources)) {
                try {

                    const path = resource.path;
                    const bucketName = 'tp_data';
                    // Try both tp_data and tp-data formats
                    const blobName = path
                        .replace('tp_data/', '')
                        .replace('tp-data/', '');

                    console.log(`Attempting download from ${bucketName}/${blobName}`);

                    const [content] = await storage
                        .bucket(bucketName)
                        .file(blobName)
                        .download();

                    toolResources.set(role, content.toString());
                    console.log(`Successfully downloaded ${role} resource`);
                } catch (downloadError: any) {
                    console.error(`Download error for ${role}:`, downloadError);
                    toolResources.set(role, `Error downloading: ${downloadError.message}`);
                }
            }

            resourcesMap.set(tool.name, toolResources);
        }

        // Convert Map to plain object for better visibility in results
        const resourcesObject = Object.fromEntries(
            Array.from(resourcesMap.entries()).map(([toolName, resources]) => [
                toolName,
                Object.fromEntries(resources)
            ])
        );

        return {
            resources: resourcesObject,
            messages: [new AIMessage("Resources loaded successfully")]
        };
    } catch (error: any) {
        console.error("Error in nodeLoadResources:", error);
        return {
            resources: {},
            messages: [new AIMessage(`Error loading resources: ${error.message}`)]
        };
    }
};


const nodeGenerateCandidate = async (state: typeof State.State) => {
    return { messages: [new AIMessage("Candidate loaded")] };
};


const nodeInvokeDocking = async (state: typeof State.State) => {
    try {
        // Get the first autodock tool and its resources
        const autodockTool = state.direction.tools[0];
        if (!autodockTool || autodockTool.name !== 'autodock') {
            throw new Error("No autodock tool found in direction");
        }

        const ligSmilesPath = autodockTool.resources.anchor.path.replace('tp-data/', 'tp_data/');
        const ligBoxPath = autodockTool.resources.box.path.replace('tp-data/', 'tp_data/');
        const recNoLigPath = autodockTool.resources.target.path.replace('tp-data/', 'tp_data/');

        // Extract paths from the resources
        const payload = {
            lig_name: "imatinib", // Static for now
            lig_smiles_path: ligSmilesPath,
            lig_box_path: ligBoxPath,
            rec_name: "1iep", // Static for now
            rec_no_lig_path: recNoLigPath
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

        const result = await response.json();

        // ATTENTION_RONAK: Here we must store the results filepath (or folderpath) in the results state property.
        return {
            messages: [new AIMessage("Docking completed successfully")],
            docking: result.result
        };

    } catch (error: any) {
        console.error("Error in nodeInvokeDocking:", error);
        return {
            messages: [new AIMessage(`Error invoking docking: ${error.message}`)]
        };
    }
};


const nodeLoadResults = async (state: typeof State.State) => {
    // ATTENTION_RONAK: Here we're we'll load the results.

    return { results: {} }
};


const nodeEvaluateResults = async (state: typeof State.State) => {
    // ATTENTION_RONAK: Here we'll evaluate the results and decide whether to retry or not.

    return { shouldRetry: false };
};


const edgeShouldRetry = (state: typeof State.State) => {
    if (state.shouldRetry) {
        return 'nodeGenerateCandidate';
    } else {
        return END;
    }
};


const stateGraph = new StateGraph(State)
    .addNode("nodeLoadResources", nodeLoadResources)
    .addNode("nodeGenerateCandidate", nodeGenerateCandidate)
    .addNode("nodeInvokeDocking", nodeInvokeDocking)
    .addNode("nodeLoadResults", nodeLoadResults)
    .addNode("nodeEvaluateResults", nodeEvaluateResults)
    .addEdge(START, "nodeLoadResources")
    .addEdge("nodeLoadResources", "nodeGenerateCandidate")
    .addEdge("nodeGenerateCandidate", "nodeInvokeDocking")
    .addEdge("nodeInvokeDocking", "nodeLoadResults")
    .addEdge("nodeLoadResults", "nodeEvaluateResults")
    .addConditionalEdges("nodeEvaluateResults", edgeShouldRetry);


export const autodockGraph = stateGraph.compile();
