import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

const app = getApps().length === 0 
    ? initializeApp({
        credential: cert(serviceAccount),
    })
    : getApps()[0];

const db = getFirestore(app);

export { db };
