import * as Constants from "shared/src/constants";
import pc from "@/setup/pinecone";
import { MessagePinecone } from "shared/src/typings";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function createIndexWrapper() {
    await pc.createIndex({
        name: Constants.EMBEDDINGS_OPENAI,
        dimension: 1536,
        metric: "cosine",
        spec: { 
            serverless: { 
                cloud: "aws", 
                region: "us-west-2" 
            }
        } 
    }) 
}

export async function upsertVectors(chatId: string, userMessage: MessagePinecone, aiMessage: MessagePinecone): Promise<void> {
    
    const index = pc.index(Constants.EMBEDDINGS_OPENAI);
    const embeddings = new OpenAIEmbeddings();
    const userMessageEmbedding = await embeddings.embedQuery(userMessage.content); 
    const aiMessageEmbedding = await embeddings.embedQuery(aiMessage.content);

    await index.namespace(chatId).upsert([
        {
          "id": userMessage.id,
          "values": userMessageEmbedding
        },
        {
          "id": aiMessage.id, 
          "values": aiMessageEmbedding
        }
      ]);
      
  }