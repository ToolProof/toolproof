'use server'
import { readFileSync } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';

// Define the structure of the credentials JSON file
interface ServiceAccountCredentials {
    client_email?: string;
    private_key?: string;
    project_id?: string;
}

// Construct an absolute path from the project root using `process.cwd`
const credentialsPath = join(process.cwd(), 'toolproof-563fe-aadab9fb0ced.json'); // ATTENTION: cwd isn't always the project root!

// Load the credentials JSON file
const credentials: ServiceAccountCredentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));

// Initialize the authentication client
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'], // or 'drive' for read/write access
});

const drive = google.drive({ version: 'v3', auth });

// Define the file structure for listing files
interface DriveFile {
    id: string;
    name: string;
}

// Function to list files directly in the "Computing" folder
export async function listFilesInComputingFolder(): Promise<DriveFile[]> {
    try {
        // Set the known "Computing" folder ID
        const computingFolderId = '1PLHF_ERzQ1RVGZmhcZ8QDyZ_Qcj0ln1z';

        // List files directly in the "Computing" folder
        const filesResponse = await drive.files.list({
            q: `'${computingFolderId}' in parents`,
            fields: 'files(id, name)',
        });

        return filesResponse.data.files as DriveFile[];
    } catch (error) {
        console.error('Error accessing the folder:', error);
        return [];
    }
}
