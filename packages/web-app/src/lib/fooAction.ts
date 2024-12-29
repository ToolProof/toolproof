'use server';
import { Storage } from '@google-cloud/storage';


export async function fooAction(fileName: string): Promise<string> {

    console.log('Fetching file:', fileName);

    const storage = new Storage();
    const bucketName = 'toolproof-yellowpapers';
    const file = storage.bucket(bucketName).file(fileName);

    try {
        const [contents] = await file.download();
        return contents.toString();
    } catch (error) {
        console.error('Error fetching file:', JSON.stringify(error));
        throw new Error('Failed to fetch file');
    }
}