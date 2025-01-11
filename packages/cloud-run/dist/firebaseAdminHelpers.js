import { Storage } from '@google-cloud/storage';
import dbAdmin from './shared/firebaseAdminInit.js';
export const uploadFileToStorage = (localFilePath, remoteFilePath) => {
    const storage = new Storage();
    return storage.bucket('toolproof-yellowpapers').upload(localFilePath, { destination: remoteFilePath });
};
export const uploadFileNameToFirestore = (fileName) => {
    const fileRef = dbAdmin.collection('files').doc(fileName);
    return fileRef.set({ fileName });
};
