import { autodockGraph } from "./autodockGraph.js";
import { Direction } from "../engine/types.js";
import { Disease, createResource, createTool } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
// import { db } from "shared/src/firebaseAdminInit"; // ATTENTION_RONAK: "shared" still isn't recognized when running the graph in Docker or on Langgraph Platform
import db from "../../firebaseAdminInit";


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    direction: Annotation<Direction>({
        reducer: (prev, next) => next
    }),
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

                // ATTENTION: every resource doesn't neccearily belong to a tool

                // Convert resource list into the required object structure
                const resourcesObject = resources.reduce((acc, resource) => {
                    if (resource) acc[resource.role] = resource;
                    return acc;
                }, {} as Record<string, { role: string; path: string; description: string }>);

                return createTool(toolData.name, resourcesObject); // ATTENTION: how can resourcesObject be accepted?
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
        return { messages: [new AIMessage("Error loading Direction")] };
    }
};


const nodeInvokeSubgraph = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {

    // ATTENTION_RONAK: Here we must transfer the state.direction.resources to the subgraph and invoke it.

    return { messages: [new AIMessage("Subgraph invoked")] };

};


const stateGraph = new StateGraph(State)
    .addNode("nodeLoadDirection", nodeLoadDirection)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeLoadDirection")
    .addEdge("nodeLoadDirection", "nodeInvokeSubgraph");


export const graph = stateGraph.compile();
