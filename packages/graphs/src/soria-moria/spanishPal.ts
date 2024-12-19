import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

let prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your role is to answer the user in Spanish, no matter what language the user uses.",
    ],
    new MessagesPlaceholder("messages"),
]);


const callModel = async (state: typeof MessagesAnnotation.State) => {

    const chain = prompt.pipe(model);

    const response = await chain.invoke(state);

    return { messages: [response] };
}


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")



export const graph = stateGraph.compile();