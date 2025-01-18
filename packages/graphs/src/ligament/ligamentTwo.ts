import { StateGraph, Annotation, MessagesAnnotation } from "@langchain/langgraph";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as Helpers from "./helpers.js"
import { syllablesNode } from "./ligamentThree.js";

// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";

// Define your LangGraph state
const State = Annotation.Root({
    ...MessagesAnnotation.spec,
});


const stressAndSoundNode = async (state: typeof State.State) => {

    try {

        const originalWord_ = state.messages[state.messages.length - 2]?.content;
        const OriginalWordSchema = z.string();
        const originalWord = OriginalWordSchema.parse(originalWord_);

        const syllablesResponse_ = state.messages[state.messages.length - 1]?.content;
        const syllablesResponse = Helpers.schemas.SyllablesSchema.parse(syllablesResponse_);
        const syllables = syllablesResponse.syllables;

        const OutputSchema = z.object({
            stress: Helpers.schemas.StressSchema(syllables),
            sound: Helpers.schemas.SoundSchema,
        });

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `First: ${Helpers.prompts.stress.system} Second: ${Helpers.prompts.sound.system}`
                },
                { role: "user", content: `Word: ${originalWord}. Syllables: ${syllables.join(", ")}` },
            ],
            response_format: zodResponseFormat(OutputSchema, "stressAndSoundNode"),
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
    .addNode("stressAndSoundNode", stressAndSoundNode)
    .addEdge("__start__", "syllablesNode")
    .addEdge("syllablesNode", "stressAndSoundNode")
    .addEdge("stressAndSoundNode", "__end__");


export const graph = stateGraph.compile();
