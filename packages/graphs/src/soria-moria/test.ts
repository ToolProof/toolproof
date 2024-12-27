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

let chatPromptTemplate = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Your job is to output a yellowpaper on how to cure and prevent {disease}.",
    ],
    new MessagesPlaceholder("messages"),
]);


const callModel = async (state: typeof MessagesAnnotation.State) => {
   
    console.log("state", JSON.stringify(state, null, 2));

    const chain = chatPromptTemplate.pipe(model);

    const response = await chain.invoke(state);

    return { messages: [response] };
}


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("output", callModel)
    .addEdge("__start__", "output")



export const graph = stateGraph.compile();