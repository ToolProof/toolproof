import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});


const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);

    return { messages: [response] };
}


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")


export const graph = stateGraph.compile();