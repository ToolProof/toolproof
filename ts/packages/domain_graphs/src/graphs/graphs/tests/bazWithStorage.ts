import { StateGraph, Annotation, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize OpenAI client
const openai = new OpenAI();
const model = "gpt-4o-mini";

// Initialize Google Cloud Storage with explicit credentials
const storage = new Storage({
    keyFilename: path.join(process.cwd(), 'gcp-key.json')
});

const bucketName = 'tp_data';
const folderName = 'test_lang_graph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const State = Annotation.Root({
    ...MessagesAnnotation.spec,
    topic: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "Sweden",
    }),
    filePath: Annotation<string>({
        reducer: (prev, next) => next,
        default: () => "",
    }),
});

async function uploadToStorage(content: string, fileName: string): Promise<string> {
    const isVercel = process.env.VERCEL === '1';
    const rootDir = path.join(dirname(__dirname), '../../../'); // Goes up to ts directory
    const tempDir = isVercel ? '/tmp' : path.join(rootDir, 'temp');
    console.log('tempDir:', tempDir);

    if (!isVercel && !fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, fileName);
    console.log('filePath:', filePath);
    
    try {
        // Write the file
        fs.writeFileSync(filePath, content);

        // Include the folder name in the destination path
        const destinationPath = `${folderName}/${fileName}`;
        
        // Upload to GCS
        await storage.bucket(bucketName).upload(filePath, {
            destination: destinationPath,
        });

        // Delete the local file after successful upload
        fs.unlinkSync(filePath);
        console.log(`Local file deleted: ${filePath}`);

        return `gs://${bucketName}/${destinationPath}`;
    } catch (error) {
        // Clean up the local file in case of upload error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Local file deleted after error: ${filePath}`);
        }
        throw error;
    }
}

const shouldContinue = async (state: typeof State.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const isRelevant = lastMessage.response_metadata?.is_relevant;

    if (isRelevant === "no") {
        return END;
    } else {
        return "masterNode";
    }
};

const filterNode = async (state: typeof State.State) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        const content = z.string().parse(lastMessage.content);

        const response = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                { role: "system", content: `Your task is to determine whether the user's message is relevant, in a broad sense, to the stated topic. Topic: ${state.topic}` },
                { role: "user", content: content },
            ],
            response_format: zodResponseFormat(z.object({ isRelevant: z.union([z.literal("yes"), z.literal("no")]) }), "filter"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        const updatedMessage = new HumanMessage({
            id: lastMessage.id,
            content: lastMessage.content,
            response_metadata: {
                is_relevant: parsedResponse?.isRelevant,
            },
        });

        return { messages: [updatedMessage] };
    } catch (error) {
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
                { role: "system", content: `Discuss the topic with the user. Topic: ${state.topic}` },
                { role: "user", content: content },
            ],
            response_format: zodResponseFormat(z.object({ response: z.string() }), "master"),
        });

        const parsedResponse = response.choices[0].message.parsed;

        if (!parsedResponse) {
            throw new Error("Failed to parse response");
        }

        // Add timestamp to filename for uniqueness
        const timestamp = Date.now();
        const fileName = `response_${timestamp}.md`;
        const gcsPath = await uploadToStorage(parsedResponse.response, fileName);

        const aiMessage = new AIMessage({
            content: parsedResponse.response,
            additional_kwargs: {
                gcs_path: gcsPath
            }
        });

        return { 
            messages: [aiMessage],
            filePath: gcsPath
        };

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
