import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as Helpers from "./helpers.js"

// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";

// Define your LangGraph state
const State = Annotation.Root({
    ...MessagesAnnotation.spec,
});


export const syllablesNode = async (state: typeof State.State) => {

    try {

        const originalWord_ = state.messages[state.messages.length - 1]?.content;
        const OriginalWordSchema = z.string();
        const originalWord = OriginalWordSchema.parse(originalWord_);

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: Helpers.prompts.syllable.system },
                { role: "user", content: Helpers.prompts.syllable.user(originalWord) },
            ],
            response_format: zodResponseFormat(Helpers.schemas.SyllablesSchema, "syllables"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }

        return { messages: [{ role: "assistant", content: parsedResponse }] };

    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }

};


const stressNode = async (state: typeof State.State) => {

    try {

        const originalWord_ = state.messages[state.messages.length - 2]?.content;
        const OriginalWordSchema = z.string();
        const originalWord = OriginalWordSchema.parse(originalWord_);

        const syllablesResponse_ = state.messages[state.messages.length - 1]?.content;
        const syllablesResponse = Helpers.schemas.SyllablesSchema.parse(syllablesResponse_);
        const syllables = syllablesResponse.syllables;

        const syllablesString = syllables.join(", ");

        // Use OpenAI's structured outputs feature
        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: Helpers.prompts.stress.system },
                { role: "user", content: Helpers.prompts.stress.user(originalWord, syllablesString) },
            ],
            response_format: zodResponseFormat(Helpers.schemas.StressSchema(syllables), "stress"),
        });

        // Extract the parsed response
        const parsedResponse = response.choices[0].message.parsed;

        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }

        return { messages: [{ role: "assistant", content: parsedResponse }] };

    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }

};


const soundNode = async (state: typeof State.State) => {

    try {

        const originalWord_ = state.messages[state.messages.length - 3]?.content;
        const OriginalWordSchema = z.string();
        const originalWord = OriginalWordSchema.parse(originalWord_);

        const syllablesResponse_ = state.messages[state.messages.length - 2]?.content;
        const syllablesResponse = Helpers.schemas.SyllablesSchema.parse(syllablesResponse_);
        const syllables = syllablesResponse.syllables;

        const stressResponse_ = state.messages[state.messages.length - 1]?.content;
        const stressResponse = Helpers.schemas.StressSchema(syllables).parse(stressResponse_);
        const stress = stressResponse.stress;

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                {
                    role: "system", content: Helpers.prompts.sound.system,
                },
                { role: "user", content: Helpers.prompts.sound.user(originalWord, stress) },
            ],
            response_format: zodResponseFormat(Helpers.schemas.SoundSchema, "sound"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }

        return { messages: [{ role: "assistant", content: parsedResponse }] };

    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }

};


const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("syllablesNode", syllablesNode)
    .addNode("stressNode", stressNode)
    .addNode("soundNode", soundNode)
    .addEdge("__start__", "syllablesNode")
    .addEdge("syllablesNode", "stressNode")
    .addEdge("stressNode", "soundNode")
    .addEdge("soundNode", "__end__");


export const graph = stateGraph.compile();
