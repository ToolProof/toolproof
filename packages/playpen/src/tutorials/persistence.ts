import dotenv from "dotenv";
dotenv.config();
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
});


import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchTool = tool(async ({ }: { query: string }) => {
    // This is a placeholder for the actual implementation
    return "Cold, with a low of 13 ℃";
}, {
    name: "search",
    description:
        "Use to surf the web, fetch current information, check the weather, and retrieve other information.",
    schema: z.object({
        query: z.string().describe("The query to use in your search."),
    }),
});

await searchTool.invoke({ query: "What's the weather like?" });

const tools = [searchTool];


import { ToolNode } from "@langchain/langgraph/prebuilt";

const toolNode = new ToolNode(tools)


import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ model: "gpt-4o" });

const boundModel = model.bindTools(tools);

import { END, START, StateGraph } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";

const routeMessage = (state: typeof GraphState.State) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    // If no tools are called, we can finish (respond to the user)
    if (!lastMessage.tool_calls?.length) {
        return END;
    }
    // Otherwise if there is, we continue and call the tools
    return "tools";
};

const callModel = async (
    state: typeof GraphState.State,
    config?: RunnableConfig,
) => {
    const { messages } = state;
    const response = await boundModel.invoke(messages, config);
    return { messages: [response] };
};

const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", routeMessage)
    .addEdge("tools", "agent");

export const graph = workflow.compile();




import { MemorySaver } from "@langchain/langgraph";

// Here we only save in-memory
const memory = new MemorySaver();
const persistentGraph = workflow.compile({ checkpointer: memory });
let config = { configurable: { thread_id: "conversation-num-1" } };
let inputs = { messages: [{ role: "user", content: "Hi I'm Jo, nice to meet you." }] };
for await (
    const { messages } of await persistentGraph.stream(inputs, {
        ...config,
        streamMode: "values",
    })
) {
    let msg = messages[messages?.length - 1];
    if (msg?.content) {
        console.log(msg.content);
    } else if (msg?.tool_calls?.length > 0) {
        console.log(msg.tool_calls);
    } else {
        console.log(msg);
    }
    console.log("-----\n");
}


inputs = { messages: [{ role: "user", content: "Remember my name?" }] };
for await (
    const { messages } of await persistentGraph.stream(inputs, {
        ...config,
        streamMode: "values",
    })
) {
    let msg = messages[messages?.length - 1];
    if (msg?.content) {
        console.log(msg.content);
    } else if (msg?.tool_calls?.length > 0) {
        console.log(msg.tool_calls);
    } else {
        console.log(msg);
    }
    console.log("-----\n");
}