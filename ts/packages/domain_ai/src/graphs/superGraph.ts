import { subGraphs } from "./subGraphs.js";
import { Recipe } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { db } from "../../firebaseAdminInit.js";

const bucketName = 'tp_resources';

// Define interface for application data
interface ApplicationData {
    id: string;
    name?: string;
    description?: string;
    inputs: {
        ligand: any;
        receptor: any;
        box: any;
        [key: string]: any;
    };
    status?: string;
    timestamp?: any;
    metadata?: Record<string, any>;
}

// Interface for resource data structure
interface ResourceData {
    description: string;
    filetype: string;
    generator: string;
    metamap: {
        role?: string;
        type?: string;
    };
    name: string;
    path?: string;
    timestamp: any;
}

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    subGoal: Annotation<string>({
        reducer: (prev, next) => next
    }),
    recipe: Annotation<Recipe>({
        reducer: (prev, next) => next
    }),
    applicationId: Annotation<string>({
        reducer: (prev, next) => next
    }),
    application: Annotation<ApplicationData>({
        reducer: (prev, next) => next
    }),
    ligandPath: Annotation<string>({
        reducer: (prev, next) => next
    }),
    receptorPath: Annotation<string>({
        reducer: (prev, next) => next
    }),
    boxPath: Annotation<string>({
        reducer: (prev, next) => next
    })
});

const nodeFetchApplication = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        if (!state.applicationId) {
            throw new Error("Application ID is missing");
        }

        // Get application document
        const applicationRef = db.collection("applications").doc(state.applicationId);
        const applicationSnap = await applicationRef.get();

        if (!applicationSnap.exists) {
            throw new Error(`Application with ID ${state.applicationId} not found`);
        }
        
        const applicationData = applicationSnap.data();

        if (!applicationData) {
            throw new Error("Application document is empty");
        }
        
        // Get input references
        const inputs = applicationData.inputs || {};

        // Handle nested structure - find the first key that contains the resources
        let ligandRef, receptorRef, boxRef;

        // Check if inputs has a nested structure
        const firstKey = Object.keys(inputs)[0];
        if (firstKey && typeof inputs[firstKey] === 'object' && inputs[firstKey].ligand) {
            // Nested structure case
            ligandRef = inputs[firstKey].ligand;
            receptorRef = inputs[firstKey].receptor;
            boxRef = inputs[firstKey].box;
        } else {
            // Direct structure case
            ligandRef = inputs.ligand;
            receptorRef = inputs.receptor;
            boxRef = inputs.box;
        }

        if (!ligandRef || !receptorRef || !boxRef) {
            throw new Error("Missing required resource references");
        }
        
        // Fetch resources in parallel
        const [ligandSnap, receptorSnap, boxSnap] = await Promise.all([
            ligandRef.get(),
            receptorRef.get(),
            boxRef.get()
        ]);
        
        // Extract resource data
        const ligandData = ligandSnap.exists ? ligandSnap.data() as ResourceData : null;
        const receptorData = receptorSnap.exists ? receptorSnap.data() as ResourceData : null;
        const boxData = boxSnap.exists ? boxSnap.data() as ResourceData : null;
        
        if (!ligandData || !receptorData || !boxData) {
            throw new Error("One or more required resources not found");
        }
        
        console.log("Resource data:", {
            ligand: ligandData,
            receptor: receptorData,
            box: boxData
        });
        
        // Construct resource paths
        // Format: resources/{resourceId}.{filetype}
        const ligandPath = `${bucketName}/${ligandSnap.id}.${ligandData.filetype}`;
        const receptorPath = `${bucketName}/${receptorSnap.id}.${receptorData.filetype}`;
        const boxPath = `${bucketName}/${boxSnap.id}.${boxData.filetype}`;
        
        console.log("Resource paths:", { ligandPath, receptorPath, boxPath });
        
        return {
            messages: [new AIMessage("Application data fetched successfully")],
            application: applicationData as ApplicationData,
            ligandPath,
            receptorPath,
            boxPath
        };
    } catch (error: any) {
        console.error("Error in nodeFetchApplication:", error);
        return {
            messages: [new AIMessage(`Error fetching application: ${error.message}`)]
        };
    }
};

const nodeInvokeSubgraph = async (state: typeof State.State): Promise<Partial<typeof State.State>> => {
    try {
        // Use paths from state
        const subGraphState = {
            messages: state.messages,
            ligandAnchor: {
                path: state.ligandPath
            },
            receptor: {
                path: state.receptorPath
            },
            box: {
                path: state.boxPath
            },
            shouldRetry: false
        };

        // Create an AbortController with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30 mins timeout

        let result: any;
        try {
            // Invoke the subGraph with abort signal
            // ATTENTION_RONAK: Invoke Python subGraph instead
            /* result = await subGraphs[state.recipe.name].invoke(subGraphState, {
                signal: controller.signal
            }); */

            result = await subGraphs[state.recipe.name].invoke(subGraphState, {
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
            controller.abort(); // Cleanup the controller
        }

        return {
            messages: [...result.messages, new AIMessage("SubGraph completed ")],
        };

    } catch (error: any) {
        console.error("Error in nodeInvokeSubgraph:", error);
        return {
            messages: [new AIMessage(`Error invoking subGraph: ${error.message}`)]
        };
    }
};

const edgeShouldContinue = (state: typeof State.State) => {
    console.log('state :', state);
    if (false) {
        return 'nodeInvokeSubgraph';
    } else {
        return END;
    }
}

const stateGraph = new StateGraph(State)
    .addNode("nodeFetchApplication", nodeFetchApplication)
    .addNode("nodeInvokeSubgraph", nodeInvokeSubgraph)
    .addEdge(START, "nodeFetchApplication")
    .addEdge("nodeFetchApplication", "nodeInvokeSubgraph")
    .addConditionalEdges("nodeInvokeSubgraph", edgeShouldContinue)

export const graph = stateGraph.compile();
