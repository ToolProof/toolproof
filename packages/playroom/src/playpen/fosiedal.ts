import { listFilesInFolder } from '../lib/googleDrive.ts';

(async () => {
    const filesList = await listFilesInFolder();
    filesList.forEach(file => console.log(file.name));
})(); 

// node --loader ts-node/esm fosiedal.ts