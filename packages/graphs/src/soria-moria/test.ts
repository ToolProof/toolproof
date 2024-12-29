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
    goal: Annotation<"cure" | "prevent">(),
    disease: Annotation<string>(),
});


const chatPromptTemplateContent = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to output everything you know about how to {goal} {disease}.", // ATTENTION: disease could be generalized
    ],
    // new MessagesPlaceholder("messages"),
]);

const chatPromptTemplateStructure = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to output a technical yellopaper, in Swedish, based on the content of the previous message.",
    ],
    new MessagesPlaceholder<typeof State['spec']>("messages"),
]);

const contentNode = async (state: typeof State.State) => {

    console.log("chatPromptTemplateContent:", JSON.stringify(chatPromptTemplateContent));

    const chain = chatPromptTemplateContent.pipe(model);

    const foo = "cure";
    const bar = "Diabetes Type 1";

    try {
        const response = await chain.invoke({
            ...state,
            goal: foo, // ATTENTION: hardcoded for now
            disease: bar, // ATTENTION: hardcoded for now
        });
        // console.log("Model response:", response);
        return { messages: [response], goal: foo, disease: bar };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

const structureNode = async (state: typeof State.State) => {
    // ATTENTION: goal and disease are not propagated to structureNode
    console.log("structureNode received state:", JSON.stringify(state));

    const chain = chatPromptTemplateStructure.pipe(model);

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
    .addNode("contentNode", contentNode)
    .addNode("structureNode", structureNode)
    .addEdge("__start__", "contentNode")
    .addEdge("contentNode", "structureNode")


export const graph = stateGraph.compile();