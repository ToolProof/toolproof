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
    lastMessage: Annotation<string>(),
});


const chatPromptTemplateOne = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is critizise the assertion in the opening message.",
    ],
    new MessagesPlaceholder<typeof GraphState['spec']>("messages"),
]);

const chatPromptTemplateTwo = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to disagree with this assertion: {lastMessage}.",
    ],
    new MessagesPlaceholder<typeof GraphState['spec']>("messages"),
]);

// ATTENTION: how to type node functions?
const nodeOne = async (state: typeof GraphState.State) => {

    const chain = chatPromptTemplateOne.pipe(model);

    try {
        const response = await chain.invoke(state);
        // console.log("Model response:", response);
        return { messages: [response], lastMessage: response };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

const nodeTwo = async (state: typeof GraphState.State) => {

    const chain = chatPromptTemplateTwo.pipe(model);

    try {
        const response = await chain.invoke(state);
        // console.log("Model response:", response);
        return { messages: [response], lastMessage: response };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

const shouldContinue = (state: typeof GraphState.State) => {
    if (state.messages.length < 5) {
        return "nodeTwo";
    } else {
        return "__end__";
    }
};


const stateGraph = new StateGraph(GraphState)
    .addNode("nodeOne", nodeOne)
    .addNode("nodeTwo", nodeTwo)
    .addEdge("__start__", "nodeOne")
    .addEdge("nodeOne", "nodeTwo")
    .addConditionalEdges("nodeTwo", shouldContinue);


export const graph = stateGraph.compile();