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


const publicUrl = "https://storage.googleapis.com/ligand/imatinib_protomer-1_out.pdbqt";

const fetchFile = async (url: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const fileData = await response.text(); // Use `.json()` for JSON files, `.arrayBuffer()` for binary
        const fileExtract = fileData.substring(0, 10000);
        console.log("File contents:", JSON.stringify(fileExtract, null, 2));
        return fileExtract;
    } catch (error) {
        console.error("Error fetching file:", error);
        throw error;
    }
};


export const recordNode = async (state: typeof State.State) => {

    try {

        const input_ = state.messages[state.messages.length - 1]?.content;
        const InputSchema = z.string();
        const input = InputSchema.parse(input_);

        const fileExtract = await fetchFile(publicUrl);

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: "What is the provided file content about?" },
                { role: "user", content: JSON.stringify(fileExtract) },
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
