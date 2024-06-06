import { listFilesInComputingFolder } from '../lib/googleDrive.ts';

(async () => {
    const filesList = await listFilesInComputingFolder();
    filesList.forEach(file => console.log(file.name));
})(); 