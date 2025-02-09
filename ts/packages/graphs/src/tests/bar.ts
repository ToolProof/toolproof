import { StateGraph, Annotation, MessagesAnnotation, START } from "@langchain/langgraph";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { HumanMessage } from "@langchain/core/messages";


const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    goal: Annotation<string>({
        reducer: (prev, next) => next, // Simple reducer that replaces the value
        default: () => "Curing Dementia with Lewy Bodies", // Initial default value
    }),

});


// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";


// Filter Node: Determines if the last message is relevant to the topic
const filterNode = async (state: typeof State.State) => {
    const lastMessage = state.messages[state.messages.length - 1];

    console.log("Before update:", JSON.stringify(lastMessage, null, 2));

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
};


const logNode = async (state: typeof State.State) => {

    const lastMessage = state.messages[state.messages.length - 1];

    console.log("After Update", JSON.stringify(lastMessage, null, 2));

    return {};
};


const stateGraph = new StateGraph(State)
    .addNode("filterNode", filterNode)
    .addNode("logNode", logNode)
    .addEdge(START, "filterNode")
    .addEdge("filterNode", "logNode");


export const graph = stateGraph.compile();