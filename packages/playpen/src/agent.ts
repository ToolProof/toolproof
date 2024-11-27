// IMPORTANT - Add your API keys here. Be careful not to publish them.
process.env.OPENAI_API_KEY = "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";
process.env.TAVILY_API_KEY = "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";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

class LoggingTavilySearchResults extends TavilySearchResults {
    async invoke(input: string): Promise<any> {
        const results = await super.invoke(input); // Call the original tool's method
        // console.log("Raw Tavily Search Results:", JSON.stringify(results, null, 2));
        return results; // Pass results back for further processing
    }
}

// Define the tools for the agent to use
const tools = [new LoggingTavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

// Create a model and give it access to the tools
const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
}).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1];

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.additional_kwargs.tool_calls) {
        return "tools";
    }
    // Otherwise, we stop (reply to the user) using the special "__end__" node
    return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);

    // We return a list, because this will get added to the existing list
    return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
export const graph = workflow.compile();

/* // Use the agent
const finalState = await graph.invoke({
    messages: [new HumanMessage("what is the weather in Oslo?")],
});
console.log(finalState.messages[finalState.messages.length - 1].content);

const nextState = await graph.invoke({
    // Including the messages from the previous run gives the LLM context.
    // This way it knows we're asking about the weather in NY
    messages: [...finalState.messages, new HumanMessage("what about Jakarta?")],
});
console.log(nextState.messages[nextState.messages.length - 1].content); */