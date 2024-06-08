'use server'
import { readFileSync } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

// Define the file structure for listing files
export interface DriveFile {
    id: string;
    name: string;
}

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
const authClient = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth: authClient });

// Function to list files directly in the folder
export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    try {

        // List files directly in the folder
        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name)',
        });

        return filesResponse.data.files as DriveFile[];
    } catch (error) {
        console.error('Error accessing the folder:', error);
        return [];
    }
}

// Function to read a file from Google Drive
export async function readFile(fileId: string): Promise<string> {
    try {
        // Get the file metadata to check MIME type
        const fileMeta = await drive.files.get({ fileId, fields: 'mimeType' });

        let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

        // If the file is a Google Docs file, we need to export it
        if (fileMeta.data.mimeType === 'application/vnd.google-apps.document') {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
        }

        // Perform the request to download the file content
        const response = await authClient.request({
            url: downloadUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const arrayBuffer = response.data as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);

        // Convert the .docx buffer to HTML using Mammoth
        const result = await mammoth.convertToHtml({ buffer });
        const htmlContent = result.value;
        // return htmlContent || '';

        // Convert the HTML content to Markdown using Turndown
        const turndownService = new TurndownService();
        const markdownContent = turndownService.turndown(htmlContent);

        return markdownContent || '';
    } catch (error) {
        console.error('Error reading the file:', error);
        return '';
    }
}

