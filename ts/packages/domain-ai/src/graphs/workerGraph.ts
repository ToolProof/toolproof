import { Direction } from "../engine/types.js";
import { Disease, createResource, createTool } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
// import dbAdmin from "shared/src/firebaseAdminInit"; // ATTENTION_RONAK: We should use this import instead of the next one, but for some reason "shared" is not recognized, despite I've included it in both langgraph.json and package.json. Can you fix this? Going forward, several modules will need to be shared across different packages, so it's important to keep the codebase DRY.
import dbAdmin from "../../firebaseAdminInit";

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    direction: Annotation<Direction>({
        reducer: (prev, next) => next
    }),
    resources: Annotation<Map<string, Map<string, string>>>({
        reducer: (prev, next) => next
    })
});


const nodeLoadDirection = async (state: typeof State.State) => {

    let direction = {
        subGoal: new Disease({ code: '8A22', name: 'Lewy Body Disease' }),
        description: 'Try to find a candidate ligand that binds to the Target better than the Anchor.',
        tools: [
            createTool('autodock', {
                anchor: createResource('anchor', 'tp-data/resources/imatinib.txt'),
                target: createResource('target', 'tp-data/resources/1iep_no_lig.pdb'),
                box: createResource('box', 'tp-data/resources/xray-imatinib.pdb'),
            })
        ]
    };

    // return { direction: direction, messages: [new AIMessage("Direction loaded")] };

    // ATTENTION_RONAK: Can you see if you can get the loading of Direction from Firestore to work so that we can replace the hardcoded object above? Currently, it fails with the error "Error loading Direction".

    // Load Direction from Firestore
    try {
        // Step 1: Fetch the Direction document
        const directionRef = dbAdmin.collection("directions").doc("drvYNXsHPYV8fm1yURtQ"); // Replace with dynamic ID if needed
        const directionSnap = await directionRef.get();

        if (!directionSnap.exists) {
            throw new Error("Direction document not found");
        }

        const directionData = directionSnap.data();

        if (!directionData) {
            throw new Error("Direction document is empty");
        }

        // Step 2: Fetch the subGoal document
        const subGoalRef = dbAdmin.doc(directionData.subGoal);
        const subGoalSnap = await subGoalRef.get();

        if (!subGoalSnap.exists) {
            throw new Error("SubGoal document not found");
        }

        const subGoalData = subGoalSnap.data();

        if (!subGoalData) {
            throw new Error("SubGoal document is empty");
        }

        const subGoal = new Disease({ code: subGoalData.code, name: subGoalData.name });

        // Step 3: Fetch the tools
        const tools = await Promise.all(
            directionData.tools.map(async (toolPath: string) => {
                const toolRef = dbAdmin.doc(toolPath);
                const toolSnap = await toolRef.get();

                if (!toolSnap.exists) return null;

                const toolData = toolSnap.data();

                if (!toolData) return null;

                // Step 4: Fetch resources for the tool
                const resources = await Promise.all(
                    Object.entries(directionData.resources).map(async ([role, resourcePath]) => {
                        // Ensure resourcePath is a string before passing it to doc()
                        if (typeof resourcePath !== "string") {
                            console.error(`Invalid resource path for role ${role}:`, resourcePath);
                            return null;
                        }

                        const resourceRef = dbAdmin.doc(resourcePath);
                        const resourceSnap = await resourceRef.get();

                        if (!resourceSnap.exists) return null;

                        const resourceData = resourceSnap.data();

                        if (!resourceData) return null;

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

        direction = {
            subGoal,
            description: directionData.description,
            tools: tools.filter(Boolean) // Remove nulls if any tool fetch fails
        };

        return { direction: direction, messages: [new AIMessage("Direction loaded")] };
    } catch (error) {
        console.error("Error loading Direction:", error);
        return { direction: direction, messages: [new AIMessage("Error loading Direction")] };
    }
};


const nodeLoadResources = async (state: typeof State.State) => {
    // ATTENTION_RONAK: Can you see if you can load the resources files from Cloud Storage and store their contents in the resources state object? Python has better tooling for chunking up the pdb files, though... Would it be possible to to do the chunking in a Python node and get the results back here (as JSON)?

    // Uncomment the line below to see the direction object in messages
    // return { messages: [new AIMessage(JSON.stringify(state.direction))] };

    return { messages: [new AIMessage("Resources loaded")] };
};


const nodeGenerateCandidate = async (state: typeof State.State) => {

};

const nodeInvokeDocking = async (state: typeof State.State) => {
    // ATTTENTION_RONAK: We should invoke Autodock Vina here...
};


const stateGraph = new StateGraph(State)
    .addNode("nodeLoadDirection", nodeLoadDirection)
    .addNode("nodeLoadResources", nodeLoadResources)
    .addNode("nodeGenerateCandidate", nodeGenerateCandidate)
    .addNode("nodeInvokeDocking", nodeInvokeDocking)
    .addEdge(START, "nodeLoadDirection")
    .addEdge("nodeLoadDirection", "nodeLoadResources") // ATTENTION_RONAK: We're skipping nodeGenerateCandidate for now--we'll just use the Anchor as Candidate for now
    .addEdge("nodeLoadResources", "nodeInvokeDocking")
    .addEdge("nodeInvokeDocking", END);


export const graph = stateGraph.compile();
