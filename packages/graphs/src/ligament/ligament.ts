import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Initialize OpenAI client
const openai = new OpenAI();

// Define the structured output schema
const SyllablesResponse = z.object({
    syllables: z.array(z.string()),
});

// Define your LangGraph state
const State = Annotation.Root({
    ...MessagesAnnotation.spec,
});

// Custom function to invoke OpenAI API with structured output
const syllablesnode = async (state: typeof State.State) => {
    try {

        const messageContent = state.messages[state.messages.length - 1]?.content;

        // Use OpenAI's structured outputs feature
        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Your job is to split the provided word into syllables in accordance with American-English pronunciation." },
                { role: "user", content: typeof messageContent === "string" ? messageContent : "" },
            ],
            response_format: zodResponseFormat(SyllablesResponse, "syllables"),
        });

        // Extract the parsed response
        const parsedResponse = response.choices[0].message.parsed;
        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }
        return { messages: [{ role: "assistant", content: parsedResponse.syllables }] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

// Create the LangGraph
const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("syllablesnode", syllablesnode)
    .addEdge("__start__", "syllablesnode");

export const graph = stateGraph.compile();
