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
import { createReactAgent } from "@langchain/langgraph/prebuilt";

/* import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@graphs-langgraph-postgres-1:5432/postgres"
});

const checkpointer = new PostgresSaver(pool);

// NOTE: you need to call .setup() the first time you're using your checkpointer

await checkpointer.setup(); */

export const graph = createReactAgent({
  tools: [getWeather],
  llm: new ChatOpenAI({
    model: "gpt-4o-mini",
  }),
  // checkpointSaver: checkpointer,
});