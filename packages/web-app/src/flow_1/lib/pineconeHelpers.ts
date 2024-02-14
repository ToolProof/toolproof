import pc from "@/flow_1/setup/pinecone";
import { MessagePinecone } from "shared/src/flow_0/typings";

export default async function foo(chatId: string, userMessage: MessagePinecone, aiMessage: MessagePinecone): Promise<void> {
    console.log("foo", chatId, userMessage, aiMessage);
    await pc.createIndex({
        name: "test-index",
        dimension: 1536,
        metric: "cosine",
        spec: { 
            serverless: { 
                cloud: "aws", 
                region: "us-west-2" 
            }
        } 
    }) 
    const index = pc.index("test-index");
    await index.namespace(chatId).upsert([
        {
          "id": userMessage.id,
          // calculate embedding from userMessage.content 
          "values": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
        },
        {
          "id": aiMessage.id, 
          // calculate embedding from aiMessage.content
          "values": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]
        }
      ]);
      
  }