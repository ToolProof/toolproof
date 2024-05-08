import * as CONSTANTS from 'shared/src/constants';
import pc from '@/setup/pinecone';
import { MessageReadWithoutTimestamp } from 'shared/src/typings';
import { OpenAIEmbeddings } from '@langchain/openai';


export async function createIndexWrapper() {

    // const openAIEmbeddings = new OpenAIEmbeddings();
    const indexName = `${CONSTANTS.openai}-text-embedding-ada-002`; // ATTENTION: hardcoded

    await pc.createIndex({
        name: indexName,
        dimension: 1536,
        metric: 'cosine',
        spec: { 
            serverless: { 
                cloud: 'aws', 
                region: 'us-west-2' 
            }
        } 
    }) 
}


export async function upsertVectors(conceptId: string, userMessage: MessageReadWithoutTimestamp, aiMessage: MessageReadWithoutTimestamp): Promise<void> {
    
    // const index = pc.index(CONSTANTS.embeddings_openai);
    const openAIEmbeddings = new OpenAIEmbeddings();
    // const userMessageEmbedding = await embeddings.embedQuery(userMessage.content); 
    // const aiMessageEmbedding = await embeddings.embedQuery(aiMessage.content);

    console.log('modelName:', openAIEmbeddings.modelName);
    return;

   /*  await index.namespace(conceptId).upsert([
        {
          'id': userMessage.id,
          'values': userMessageEmbedding
        },
        {
          'id': aiMessage.id, 
          'values': aiMessageEmbedding
        }
      ]); */
      
  }