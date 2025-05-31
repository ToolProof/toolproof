import { intraMorphismRegistry as intra_1, interMorphismRegistry as inter_1 } from "./ligandokreado";
import { intraMorphismRegistry as intra_2, interMorphismRegistry as inter_2 } from "./grafumilo";


export const fooRegistry = {
    fetchContentFromUrl: async () => {
        return async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
            }

            return await response.text();
        }
    },
}


export const intraMorphismRegistry = {
    ...intra_1,
    ...intra_2,
}

export const interMorphismRegistry = {
    ...inter_1,
    ...inter_2,
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






