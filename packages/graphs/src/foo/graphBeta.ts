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


const GraphState = Annotation.Root({
    ...MessagesAnnotation.spec, // Spread in the messages state
});


const chatPromptTemplateAntagonist = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is critizise the assertion in the opening message.",
    ],
    new MessagesPlaceholder("messages"),
]);

const chatPromptTemplateProtagonist = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to counter the assertion in the previous message.",
    ],
    new MessagesPlaceholder<typeof GraphState['spec']>("messages"),
]);

const antagonistNode = async (state: typeof GraphState.State) => {

    const chain = chatPromptTemplateAntagonist.pipe(model);

    try {
        const response = await chain.invoke(state);
        // console.log("Model response:", response);
        return { messages: [response] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

const protagonistNode = async (state: typeof GraphState.State) => {

    const chain = chatPromptTemplateProtagonist.pipe(model);

    const lastMessage = state.messages[state.messages.length - 1]; 

    try {
        const response = await chain.invoke({ messages: [lastMessage] });
        // console.log("Model response:", response);
        return { messages: [response] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};


const stateGraph = new StateGraph(GraphState)
    .addNode("antagonistNode", antagonistNode)
    .addNode("protagonistNode", protagonistNode)
    .addEdge("__start__", "antagonistNode")
    .addEdge("antagonistNode", "protagonistNode")


export const graph = stateGraph.compile();