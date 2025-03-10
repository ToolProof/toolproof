import { Worker } from "../engine/worker.js";
import { Disease, createResource, createTool } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
// import dbAdmin from "shared/src/firebaseAdminInit"; // ATTENTION: should use this import instead of the next one
import dbAdmin from "../../firebaseAdminInit"; // ATTENTION: temporary hack since "shared" is not recognized--this file should be deleted once the above import works

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
});

let worker = new Worker<typeof State.State>();

const nodeLoadWorker = async (state: typeof State.State) => {
    /* worker = new Worker<typeof State.State>({
        subGoal: new Disease({ code: '8A22', name: 'Lewy Body Disease' }),
        description: 'dummy_description',
        tools: [
            createTool('autodock', {
                anchor: createResource('anchor', 'tp-data/resources/imatinib.txt'),
                target: createResource('target', 'tp-data/resources/1iep_no_lig.pdb'),
                box: createResource('box', 'tp-data/resources/xray-imatinib.pdb'),
            })
        ]
    }); */

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

        worker = new Worker<typeof State.State>({
            subGoal,
            description: directionData.description,
            tools: tools.filter(Boolean) // Remove nulls if any tool fetch fails
        });

        return { messages: [new AIMessage("Worker loaded")] };
    } catch (error) {
        console.error("Error loading Worker:", error);
        return { messages: [new AIMessage("Error loading Worker")] };
    }
};


export const nodeWorker = worker;


const stateGraph = new StateGraph(State)
    .addNode("nodeLoadWorker", nodeLoadWorker)
    .addNode("nodeWorker", nodeWorker)
    .addEdge(START, "nodeLoadWorker")
    .addEdge("nodeLoadWorker", "nodeWorker")
    .addEdge("nodeWorker", END);


export const graph = stateGraph.compile();
