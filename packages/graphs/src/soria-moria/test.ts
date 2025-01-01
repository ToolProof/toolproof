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


const State = Annotation.Root({
    ...MessagesAnnotation.spec, // Spread in the messages state
});


const chatPromptTemplateSeed = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to pick a random disease and suggest one of the ways it can be cured.",
    ],
    // new MessagesPlaceholder("messages"), // ATTENTION: target disease is masked
]);

const chatPromptTemplateCandidate = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to output a technical yellopaper, in Markdown, in which you suggest an experimental treatment for the target disease that is derived from the example of curing a random disease in the previous message.",
    ],
    new MessagesPlaceholder<typeof State['spec']>("messages"),
]);

const seedNode = async (state: typeof State.State) => {

    const chain = chatPromptTemplateSeed.pipe(model);

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

const candidateNode = async (state: typeof State.State) => {

    const chain = chatPromptTemplateCandidate.pipe(model);

    try {
        const response = await chain.invoke(state);
        // console.log("Model response:", response);
        return { messages: [response] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("seedNode", seedNode)
    .addNode("candidateNode", candidateNode)
    .addEdge("__start__", "seedNode")
    .addEdge("seedNode", "candidateNode")


export const graph = stateGraph.compile();