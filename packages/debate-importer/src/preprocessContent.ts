import { readFile, writeFile, mkdir } from 'fs/promises';
import cheerio from 'cheerio';
import he from 'he';
import path from 'path';
import { fileURLToPath } from 'url';
import Message from '../typings.d.js';

async function preprocessHelper(inputFilePath: string, htmlContent: string): Promise<string> {
  const $ = cheerio.load(htmlContent);
  const messages: Message[] = [];  // Typed array

  $('p').each((i, el) => {
    const speaker = $(el).find('b').text().trim();
    const dialogue = $(el).clone().children().remove().end().text().trim();
    const decodedDialogue = he.decode(dialogue);

    if (speaker && decodedDialogue) {
      messages.push({
        userId: speaker.replace(':', ''), // Remove the colon from the speaker's name
        content: decodedDialogue
      });
    }
  });

  // Determine the output file path based on the input file path
  const outputFileName = path.basename(inputFilePath, '.txt') + '.json';
  const outputFilePath = path.join(path.dirname(inputFilePath), '..', 'transcripts_structured', outputFileName);

  // Ensure the output directory exists
  await mkdir(path.dirname(outputFilePath), { recursive: true });

  // Now, write the structured data to the output file
  await writeFile(outputFilePath, JSON.stringify(messages, null, 2));
  return outputFileName;
}

export async function preprocessContent(fileName: string): Promise<string> {
  // Define __filename and __dirname inside the function
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const inputFilePath = path.join(__dirname, '..', 'transcripts_unstructured', fileName);
  try {
    const htmlContent = await readFile(inputFilePath, 'utf8');
    const outputFileName = await preprocessHelper(inputFilePath, htmlContent);
    return outputFileName;
  } catch (error) {
    console.error('Error reading the file:', error);
    return "Error";
  }
}
