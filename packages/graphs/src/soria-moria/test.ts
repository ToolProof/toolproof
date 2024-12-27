import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

let chatPromptTemplate = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to output a yellopaper, based on your general knowledge, for how to {goal} {disease}.", // ATTENTION: disease could be generalized
    ],
    new MessagesPlaceholder("messages"),
]);

const StateWithParameter = Annotation.Root({
    ...MessagesAnnotation.spec, // Spread in the messages state
    goal: Annotation<"cure" | "prevent">(),
    disease: Annotation<string>(),
});

const inputNode = async (state: typeof StateWithParameter) => {
    console.log("inputNode state before update:", state);
    const newState = { ...state, goal: "cure", disease: "Diabetes Type 2" };
    console.log("inputNode state after update:", newState);
    return newState;
};

const outputNode = async (state: typeof StateWithParameter) => {
    // ATTENTION: goal and disease are not propagated to outputNode
    // console.log("outputNode received state:", state);

    const chain = chatPromptTemplate.pipe(model);

    try {
        const response = await chain.invoke({
            ...state,
            goal: "cure", // ATTENTION: hardcoded for now
            disease: "Dementia Lewy Body", // ATTENTION: hardcoded for now
        });
        // console.log("Model response:", response);
        return { messages: [response] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};


const stateGraph = new StateGraph(MessagesAnnotation)
    // .addNode("inputNode", inputNode)
    .addNode("outputNode", outputNode)
    // .addEdge("__start__", "inputNode")
    // .addEdge("inputNode", "outputNode")
    .addEdge("__start__", "outputNode")


export const graph = stateGraph.compile();