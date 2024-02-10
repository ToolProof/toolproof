import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
    apiKey: "fd0bc1b8-8425-4659-b498-dba1ee900bf4", //ATTENTION: this is a hack
    environment: "asia-southeast1-gcp",
});

export const initializePinecone = async () => {
  await pinecone.createIndex({
    name: "toolproof",
    dimension: 1536,
    suppressConflicts: true,
    waitUntilReady: true,
  });
};

export default pinecone;
