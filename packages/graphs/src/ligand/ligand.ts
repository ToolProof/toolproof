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


export const recordNode = async (state: typeof State.State) => {

    try {

        const input_ = state.messages[state.messages.length - 1]?.content;
        const InputSchema = z.string();
        const input = InputSchema.parse(input_);

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: Helpers.prompts.record.system },
                { role: "user", content: Helpers.prompts.record.user() },
            ],
            response_format: zodResponseFormat(Helpers.schemas.RecordSchema, "record"),
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
    .addNode("recordNode", recordNode)
    .addEdge("__start__", "recordNode")
    .addEdge("recordNode", "__end__");


export const graph = stateGraph.compile();
