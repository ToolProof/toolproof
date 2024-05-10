import * as CONSTANTS from 'shared/src/constants';
import pc from '@/setup/pinecone';
import { MessageReadWithoutTimestamp } from 'shared/src/typings';
import { OpenAIEmbeddings } from '@langchain/openai';

const indexName = `${CONSTANTS.openai}-text-embedding-ada-002`; // ATTENTION: hardcoded

export async function createIndexWrapper() {

    // const openAIEmbeddings = new OpenAIEmbeddings(); // ATTENTION: failes when invoked by useEffect callback

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


export async function upsertVectors(conceptId: string, messages: MessageReadWithoutTimestamp[]): Promise<void> {
    const openAIEmbeddings = new OpenAIEmbeddings();
    const index = pc.index(indexName);

    // Generate embeddings for each message
    const embeddings = await Promise.all(
        messages.map(async (message) => {
            const embedding = await openAIEmbeddings.embedQuery(message.content);
            return {
                id: message.id,
                values: embedding
            };
        })
    );

    // Upsert all the message embeddings to the namespace
    await index.namespace(conceptId).upsert(embeddings);
}