import { Direction } from "../engine/types.js";
import { Disease, createResource, createTool } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { db } from "shared/src/firebaseAdminInit";
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    direction: Annotation<Direction>({
        reducer: (prev, next) => next
    }),
    resources: Annotation<Map<string, Map<string, string>>>({
        reducer: (prev, next) => next
    }),
    docking: Annotation<any>({  // You can make this more specific based on the result type
        reducer: (prev, next) => next
    })
});


const nodeLoadDirection = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {

    let direction;

    /* direction = {
        subGoal: new Disease({ code: '8A22', name: 'Lewy Body Disease' }),
        description: 'Try to find a candidate ligand that binds to the Target better than the Anchor.',
        tools: [
            createTool('autodock', {
                anchor: createResource('anchor', 'tp_data/resources/imatinib.txt'),
                target: createResource('target', 'tp_data/resources/1iep_no_lig.pdb'),
                box: createResource('box', 'tp_data/resources/xray-imatinib.pdb'),
            })
        ]
    };

    return { direction: direction, messages: [new AIMessage("Direction loaded")] }; */

    // Load Direction from Firestore
    try {
        // Step 1: Fetch the Direction document
        const directionRef = db.collection("directions").doc("drvYNXsHPYV8fm1yURtQ"); // Replace with dynamic ID if needed
        const directionSnap = await directionRef.get();

        if (!directionSnap.exists) {
            throw new Error("Direction document not found");
        }

        const directionData = directionSnap.data();

        if (!directionData) {
            throw new Error("Direction document is empty");
        }

        if (!directionData?.subGoal) {
            throw new Error("Missing subGoal reference");
        }

        // Step 2: Fetch the subGoal document - using the reference directly
        const subGoalSnap = await directionData.subGoal.get();
        const subGoalData = subGoalSnap.data();

        if (!subGoalData?.code || !subGoalData?.name) { // ATTENTION: subGoal might not be a Disease
            throw new Error("Invalid subGoal data structure");
        }

        const subGoal = new Disease({ code: subGoalData.code, name: subGoalData.name });

        // Step 3: Fetch the tools - using the references directly
        const tools = await Promise.all(
            directionData.tools.map(async (toolRef: any) => {
                const toolSnap = await toolRef.get();
                const toolData = toolSnap.data();

                if (!toolData?.name) return null;

                // Step 4: Fetch resources for the tool - using references directly
                const resources = await Promise.all(
                    Object.entries(directionData.resources).map(async ([role, resourceRef]) => {
                        const resourceSnap = await (resourceRef as FirebaseFirestore.DocumentReference).get();
                        const resourceData = resourceSnap.data();

                        if (!resourceData?.path) return null;

                        return createResource(role as any, resourceData.path);
                    })
                );

                // Convert resource list into the required object structure
                const resourcesObject = resources.reduce((acc, resource) => {
                    if (resource) acc[resource.role] = resource;
                    return acc;
                }, {} as Record<string, { role: string; path: string; description: string }>);

                return createTool(toolData.name, resourcesObject);
            })
        );

        direction ={
            subGoal,
            description: directionData.description,
            tools: tools.filter(Boolean) // Remove nulls if any tool fetch fails
        };

        return { direction: direction, messages: [new AIMessage("Direction loaded")] };
    } catch (error) {
        console.error("Error loading Direction:", error);
        return { messages: [new AIMessage("Error loading Direction")] };
    }
};


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


const stateGraph = new StateGraph(State)
    .addNode("nodeLoadDirection", nodeLoadDirection)
    // .addNode("nodeLoadResources", nodeLoadResources)
    // .addNode("nodeGenerateCandidate", nodeGenerateCandidate)
    // .addNode("nodeInvokeDocking", nodeInvokeDocking)
    .addEdge(START, "nodeLoadDirection")
    .addEdge("nodeLoadDirection", "nodeLoadResources")
    .addEdge("nodeLoadResources", "nodeGenerateCandidate")
    .addEdge("nodeGenerateCandidate", "nodeInvokeDocking") // ATTENTION_RONAK: We're skipping nodeGenerateCandidate for now--we'll just use the Anchor as Candidate for now
    .addEdge("nodeInvokeDocking", END);


export const graph = stateGraph.compile();
