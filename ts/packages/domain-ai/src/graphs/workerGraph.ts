import { Worker } from "../engine/worker.js";
import { createResource, createTool } from "../engine/types.js";
import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { OpenAI } from "@langchain/openai";


// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
});

let worker = new Worker<typeof State.State>();


const initNode = async (state: typeof State.State) => {
    worker = new Worker<typeof State.State>({
        subGoal: 'Cure Dementia with Lewy Bodies',
        description: 'Develop AI-driven workflows for drug discovery',
        tools: [
            createTool('autodock', {
                anchor: createResource('anchor', 'tp-data/resources/imatinib.txt'),
                target: createResource('target', 'tp-data/resources/1iep_no_lig.pdb'),
                box: createResource('box', 'tp-data/resources/xray-imatinib.pdb'),
            })
        ]
    });
    return { messages: [new AIMessage('Mutus')] };
};


export const workerNode = worker;


const stateGraph = new StateGraph(State)
    .addNode("initNode", initNode)
    .addNode("workerNode", workerNode)
    .addEdge(START, "initNode")
    .addEdge("initNode", "workerNode")
    .addEdge("workerNode", END);


export const graph = stateGraph.compile();
