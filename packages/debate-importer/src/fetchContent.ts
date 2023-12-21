import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export async function fetchContent(url: string): Promise<string> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    // Create a unique file name with a timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `transcript_${timestamp}.txt`;
    const directoryPath = join(__dirname, '..', 'transcripts_unstructured');
    const filePath = join(directoryPath, fileName);

    // Ensure the transcripts_unstructured directory exists
    await mkdir(directoryPath, { recursive: true });

    // Write the content to the file within the transcripts_unstructured directory
    await writeFile(filePath, data);
    return fileName;

  } catch (error) {
    if (error instanceof Error) {
      console.error('There was an error fetching the content:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
    return "Error";
  }
}
