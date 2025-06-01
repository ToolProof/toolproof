import { intraMorphismRegistry as intraMR_grafumilo, interMorphismRegistry as interMR_grafumilo } from "./grafumilo";
import { intraMorphismRegistry as intraMR_ligandokreado, interMorphismRegistry as interMR_ligandokreado } from "./ligandokreado";


export const fetchRegistry = {
    fetchContentFromUrl: async () => {
        return async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
            }

            return await response.text();
        }
    },
    fetchContentFromUrl2: async () => {
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






