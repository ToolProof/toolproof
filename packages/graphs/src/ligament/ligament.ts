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

const StressResponse = z.object({
    stress: z.string(), // ATTENTION: use literal union based on the array of syllables
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


const stressNode = async (state: typeof State.State) => {
    try {

        const messageContent = state.messages[state.messages.length - 1]?.content;

        // Use OpenAI's structured outputs feature
        const response = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Your job is to determine which syllable is stressed according to American-English pronunciation." },
                { role: "user", content: typeof messageContent === "string" ? messageContent : "" },
            ],
            response_format: zodResponseFormat(StressResponse, "stress"),
        });

        // Extract the parsed response
        const parsedResponse = response.choices[0].message.parsed;
        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }
        return { messages: [{ role: "assistant", content: parsedResponse.stress }] };
    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }
};

// Create the LangGraph
const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("syllablesnode", syllablesnode)
    .addNode("stressnode", stressNode)
    .addEdge("__start__", "syllablesnode")
    .addEdge("syllablesnode", "stressnode")

export const graph = stateGraph.compile();
