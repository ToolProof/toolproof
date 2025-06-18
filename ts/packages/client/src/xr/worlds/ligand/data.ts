'use server'
import { Storage } from '@google-cloud/storage';


export const fetchData = async (source: string) => {

    const [bucketName, ...objectPathParts] = source.split('/');
    const objectPath = objectPathParts.join('/');

    const storage = new Storage({
        keyFilename: 'C:/Users/renes/computing/toolproof/ts/packages/client/toolproof-563fe-484028d2bf27.json'
    });

    const file = storage.bucket(bucketName).file(objectPath);
    const [contents] = await file.download();

    return contents.toString('utf-8');
}