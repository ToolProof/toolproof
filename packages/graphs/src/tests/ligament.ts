import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 1,
});


const State = Annotation.Root({
    ...MessagesAnnotation.spec, // Spread in the messages state
});


const chatPromptTemplate = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is make an analogy that helps the user understand the requested topic better. You should try to use as many words as possible from the provided vocabulary list.",
    ],
    new MessagesPlaceholder("messages"),
]);

const node = async (state: typeof State.State) => {

    const chain = chatPromptTemplate.pipe(model);

    try {
        const response = await chain.invoke({
            ...state,
        });
        // console.log("Model response:", response);
        return { messages: [response] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("node", node)
    .addEdge("__start__", "node")


export const graph = stateGraph.compile();