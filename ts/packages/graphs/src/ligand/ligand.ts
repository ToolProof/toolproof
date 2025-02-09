import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import * as Helpers from "./helpers.js"

// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    goal: Annotation<string>({
        reducer: (prev, next) => next, // Simple reducer that replaces the value
        default: () => "Curing Dementia with Lewy Bodies", // Initial default value
    }),

});


const shouldContinue = async (state: typeof State.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const isRelevant = lastMessage.response_metadata?.is_relevant;

    if (isRelevant === "no") {
        return END;
    } else {
        return "masterNode";
    }

};


// Filter Node: Determines if the last message is relevant to the topic
const filterNode = async (state: typeof State.State) => {

    try {
        const lastMessage = state.messages[state.messages.length - 1];

        // console.log("Before update:", JSON.stringify(lastMessage, null, 2));

        const content = z.string().parse(lastMessage.content);

        // Call OpenAI to determine relevance
        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: `Your task is to determine whether the user's message is relevant to the stated goal. Goal: ${state.goal}` },
                { role: "user", content: content },
            ],
            response_format: zodResponseFormat(z.object({ isRelevant: z.union([z.literal("yes"), z.literal("no")]) }), "filter"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        // Create an updated version of lastMessage, preserving the ID
        const updatedMessage = new HumanMessage({
            id: lastMessage.id, // Ensure the same ID for correct replacement
            content: lastMessage.content, // Preserve content
            response_metadata: {
                is_relevant: parsedResponse?.isRelevant, // Add new metadata
            },
        });

        // Return the updated message
        return { messages: [updatedMessage] };

    }

    catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }

};


export const masterNode = async (state: typeof State.State) => {

    try {

        const lastMessage = state.messages[state.messages.length - 1];

        const content = z.string().parse(lastMessage.content);

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: `Discuss the goal with the user. Goal: ${state.goal}` },
                { role: "user", content: content }, // ATTENTION: only the last message is used here
            ],
            response_format: zodResponseFormat(z.object({ response: z.string() }), "master"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }

        return { messages: [new AIMessage(parsedResponse.response)] };

    } catch (error) {
        console.error("Error invoking model:", error);
        throw error;
    }

};


const stateGraph = new StateGraph(State)
    .addNode("filterNode", filterNode)
    .addNode("masterNode", masterNode)
    .addEdge(START, "filterNode")
    .addConditionalEdges("filterNode", shouldContinue);


export const graph = stateGraph.compile();
