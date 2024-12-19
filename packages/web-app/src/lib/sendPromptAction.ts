'use server';
import dotenv from "dotenv";
dotenv.config();

import { Client } from "@langchain/langgraph-sdk";
import { RemoteGraph } from "@langchain/langgraph/remote";

import { updateChat } from './firebaseAdminHelpers';
import { MessageRead } from 'shared/src/typings';
import { upsertVectors } from './pineconeHelpers';

interface SendPromptResponse {
    modelResponse: string;
}

const url = `https://spanish-pal-bf20aef1d10a52d1b8b04c76757c90f5.default.us.langgraph.app`;
const graphName = "agent";
const client = new Client({
    apiUrl: url,
});

const remoteGraph = new RemoteGraph({ graphId: graphName, url });

// create a thread (or use an existing thread instead)
const thread = await client.threads.create();

// invoke the graph with the thread config
const config = { configurable: { thread_id: thread.thread_id } };

export default async function sendPromptAction({ chatId, promptSeed, userName, userMessage }: { chatId: string, promptSeed: string; userName: string, userMessage: Omit<MessageRead, 'timestamp'> }): Promise<SendPromptResponse> {
    if (!promptSeed) {
        throw new Error('Prompt is required');
    }
    if (!chatId) {
        throw new Error('Chat ID is required');
    }

    try {

        const result = await remoteGraph.invoke({
            messages: [{ role: "user", content: promptSeed }],
        }, config);

        // console.log(result);

        const messagesLength = result.messages.length;

        const usageMetadata = result.messages[messagesLength - 1].usage_metadata;

        console.log('Usage metadata:', JSON.stringify(usageMetadata));

        const aiMessageContent = result.messages[messagesLength - 1].content;

        const aiMessage = await updateChat(chatId, aiMessageContent, userMessage.id, 1); // ATTENTION: turnState should be decided by the AI

        upsertVectors(chatId, [userMessage, aiMessage]); // ATTENTION: do I want to await this?

        return { modelResponse: aiMessageContent };
    } catch (error) {
        console.error('Error:', error);
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }

}

