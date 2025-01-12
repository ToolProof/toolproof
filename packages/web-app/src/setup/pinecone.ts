import { Pinecone } from '@pinecone-database/pinecone';

// ATTENTION: security risk, use environment variables

const pc = new Pinecone({
    apiKey: '5b07d8c8-8459-4dd8-b000-db70fb8c9d89'
});

export default pc;