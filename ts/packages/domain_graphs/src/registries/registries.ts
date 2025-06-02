import { intraMorphismRegistry as intraMR_grafumilo, interMorphismRegistry as interMR_grafumilo } from "./grafumilo";
import { intraMorphismRegistry as intraMR_ligandokreado, interMorphismRegistry as interMR_ligandokreado } from "./ligandokreado";
import { storage, bucketName } from '../firebaseAdminInit.js';


export const fetchRegistry = {
    fetchContentFromUrl: async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
        }
        return await response.text();
    },
    fetchContentFromUrl2: async (url: string) => {
        // Extract the "directory" path from the URL
        const match = url.match(/^https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)$/);
        if (!match) throw new Error("Invalid GCP Storage URL");
        const prefix = match[1].endsWith('/') ? match[1] : match[1] + '/';

        // List files and prefixes (subfolders) under the prefix
        const [files] = await storage
            .bucket(bucketName)
            .getFiles({
                prefix,
                delimiter: '/',
            });

        // The API returns subfolders in the second argument of getFiles
        const [, , apiResponse] = await storage
            .bucket(bucketName)
            .getFiles({
                prefix,
                delimiter: '/',
            });

        const subfolders: string[] = apiResponse.prefixes || [];
        // Return subfolder names as a string (one per line)
        return subfolders.join('\n');
    }
}


export const intraMorphismRegistry = {
    ...intraMR_grafumilo,
    ...intraMR_ligandokreado,
}

export const interMorphismRegistry = {
    ...interMR_grafumilo,
    ...interMR_ligandokreado,
}




/* export type MorphismName = keyof typeof intraMorphismRegistry;

// Extracts the resolved return type of a loader (i.e. the function returned)
type LoadedFunction<M extends MorphismName> = Awaited<ReturnType<typeof intraMorphismRegistry[M]>>;

// Extracts the final return value of calling the loaded function
type MorphismOutput<M extends MorphismName> = Awaited<ReturnType<LoadedFunction<M>>>;

// The full output map
export type MorphismOutputTypes = {
    [M in MorphismName]: MorphismOutput<M>
};

export type Resource<M extends MorphismName = MorphismName> = {
    path: string;
    morphism: M;
    value: MorphismOutputTypes[M];
};

// Can be used instead of Resource to get narrowing based on the morphism
type ResourceUnion = {
    [M in MorphismName]: Resource<M>
}[MorphismName];

export type ResourceMap = {
    [key: string]: Resource;
} */






