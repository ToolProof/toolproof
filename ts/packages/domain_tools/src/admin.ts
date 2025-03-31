import { retrieveDocumentsFromFirestore, retriveFileNamesFromStorage, cleanUpNonManualResources } from "./firebaseAdminHelpers.js";


const documents = await retrieveDocumentsFromFirestore();
console.log(documents);

const files = await retriveFileNamesFromStorage();
console.log(files);

/* await cleanUpNonManualResources();
console.log("Cleaned up non-manual resources"); */



