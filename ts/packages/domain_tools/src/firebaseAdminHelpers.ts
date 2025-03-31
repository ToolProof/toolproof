import { db, storage } from './firebaseAdminInit.js';


export const retrieveDocumentsFromFirestore = async () => {
    const snapshot = await db.collection('resources').get();

    return snapshot.docs.map(doc => doc.data());
}


export const retriveFileNamesFromStorage = async () => {

    const [files] = await storage.bucket('tp_resources').getFiles();

    return files.map(file => file.name);
}


export const cleanUpNonManualResources = async () => {
    const snapshot = await db.collection('resources').get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const documentId = doc.id;

        // Check if the "generator" field is not "manual"
        if (data.generator !== 'manual') {
            // Delete the Firestore document
            await db.collection('resources').doc(documentId).delete();

            // Construct the file name
            const fileName = `${documentId}.${data.filetype}`;

            // Delete the corresponding file in the Cloud Storage bucket
            await storage.bucket('tp_resources').file(fileName).delete();
        }
    }
};