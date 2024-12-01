import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const getWeather = tool(async (input: { city: "sf" | "nyc" }) => {
    if (input.city === "nyc") {
        return "It might be cloudy in nyc";
    } else if (input.city === "sf") {
        return "It's always sunny in sf";
    } else {
        throw new Error("Unknown city");
    }
}, {
    name: "get_weather",
    description: "Use this to get weather information.",
    schema: z.object({
        city: z.enum(["sf", "nyc"])
    }),
});


import { ChatOpenAI } from "@langchain/openai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


const checkpointerFromConnString = PostgresSaver.fromConnString(
    "postgresql://user:password@localhost:5434/testdb"
);

const graph2 = createReactAgent({
    tools: [getWeather],
    llm: new ChatOpenAI({
        model: "gpt-4o-mini",
    }),
    checkpointSaver: checkpointerFromConnString,
});
const config2 = { configurable: { thread_id: "2" } };

await graph2.invoke({
    messages: [{
        role: "user",
        content: "what's the weather in sf"
    }],
}, config2);


await checkpointerFromConnString.get(config2);