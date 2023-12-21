import 'dotenv/config';
import { readFile } from 'fs/promises';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import Message from '../typings.d.js';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const dbAdmin = admin.firestore();

export async function uploadConversation(filename: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Resolve the full path for the file
    const filePath = path.join(__dirname, '..', 'transcripts_structured', filename);

    try {
        // Read the file from the filesystem
        const fileContent = await readFile(filePath, 'utf8');

        // Parse the JSON content
        const messages: Message[] = JSON.parse(fileContent);

        // Get the userId from the filename (excluding the extension)
        const userId = path.parse(filename).name;

        // Create a new conversation document with a unique ID
        const conversationId = uuidv4(); // Generates a unique UUID for the conversation
        const conversationRef = dbAdmin.collection('conversations_beta').doc(conversationId);

        // Set the conversation document with additional fields
        await conversationRef.set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(), // Set server timestamp
            userId: userId, // Set the userId based on the input filename
        });

        // Start a batch to perform all writes in a single atomic operation
        const batch = dbAdmin.batch();

        let counter = 0;
        messages.forEach((message) => {
            const messageRef = conversationRef.collection('messages').doc();
            batch.set(messageRef, {
                timestamp: admin.firestore.Timestamp.now(), // or some dummy/placeholder timestamp
                order: counter++, // Increment the counter for each message
                userId: message.userId,
                content: message.content,
            });
        });

        // Commit the batch write to the database
        await batch.commit();

        console.log(`New conversation with ID ${conversationId} uploaded successfully.`);
    } catch (error) {
        console.error('Failed to read or parse the JSON file:', error);
    }
}