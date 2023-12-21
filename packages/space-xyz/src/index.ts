import 'dotenv/config';
import dbAdmin from "./configFirebaseAdmin.js";
import OpenAI from 'openai';
import pinecone, { initializePinecone } from "./configPinecone.js";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("OpenAI API key is not set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const initPinecone = async () => {
  try {
    await initializePinecone();
    console.log("Pinecone initialized successfully");
  } catch (error) {
    console.error("Error initializing Pinecone:", error);
  }
};

//await initPinecone();

//

async function getEmbeddings(text: string): Promise<number[]> { 
  try {
      const response = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
      });
      return response.data[0].embedding;
  } catch (error) {
      console.error('Error fetching embeddings:', error);
      throw error;
  }
}

const collectionName = "conversations";

const conversationsSnapshot = await dbAdmin.collection(collectionName).orderBy("timestamp", "asc").get();

for (const doc of conversationsSnapshot.docs) {
  await retrieveEmbedUpsert(doc);
}

async function retrieveEmbedUpsert(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {

  const conversationId = doc.id;

  let embeddings: number[][] = [];

  const messagesSnapshot = await dbAdmin.collection(collectionName).doc(conversationId).collection("messages").orderBy("timestamp", "asc").get();

  for (const doc of messagesSnapshot.docs) {
    embeddings.push(await getEmbeddings(doc.data().content));
  }

  // Reference to the Pinecone index
  const index = pinecone.index('toolproof');

  // Prepare records for Pinecone
  const records = messagesSnapshot.docs.map((doc, index) => ({
    id: doc.id, // Assuming doc.id is a unique identifier for each message
    values: embeddings[index]
  }));

  // Reference to the namespace in Pinecone
  const namespace = index.namespace(conversationId);

  // Upsert the data into your Pinecone index
  await namespace.upsert(records);

  console.log('Embeddings upserted to Pinecone');

}

// 