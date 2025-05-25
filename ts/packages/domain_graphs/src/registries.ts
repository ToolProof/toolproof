
export const intraMorphismRegistry = {
    doNothing: async () => {
        return (s: string) => s;
    },
    chunkPDBContent: async () => {
        const { chunkPDBContent } = await import('./tools/chunkPDBContent.js');
        return chunkPDBContent; // assume: (s: string) => ChunkInfo[]
    },
} as const;

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



import { ChunkInfo } from './tools/chunkPDBContent.js';

export const interMorphismRegistry = {
    abc: async () => {
        return (anchor: string, target: ChunkInfo[]) => {

            if (!anchor || !target || target.length === 0) {
                throw new Error('Missing required resources');
            }

            /* // Analyze chunks sequentially to maintain context
            let analysisContext = '';
            for (const chunk of targetChunks) {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are analyzing protein structure chunks to identify binding site characteristics. Focus on key residues and potential interaction points.'
                        },
                        {
                            role: 'user',
                            content: `
                                    Analyze the following protein chunk:
                                    Chain: ${chunk.chainId}
                                    Residues: ${chunk.startResidue}-${chunk.endResidue}
                                    
                                    Structure:
                                    ${chunk.content}
                                    
                                    Previous analysis context:
                                    ${analysisContext}
                                    
                                    Identify potential binding interactions and suggest suitable ligand modifications.
                                `
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                });

                analysisContext += '\n' + (response.choices[0].message.content?.trim() || '');
            }

            // Generate final candidate using accumulated analysis
            const finalResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate an optimized SMILES string for a new molecule that could bind effectively to the target based on ligand-receptor interactions.'
                    },
                    {
                        role: 'user',
                        content: `
                                Using this target protein analysis:
                                ${analysisContext}
        
                                And this anchor molecule SMILES:
                                ${anchor}
        
                                Generate an optimized candidate molecule using single SMILES string.
                                Respond with only the SMILES string.
                            `
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const candidate = finalResponse.choices[0].message.content?.trim(); */

            const candidate = anchor; // ATTENTION: placeholder for now

            return candidate;
        }
    },
    def: async () => {
        return (s: string) => 'Asdfgh! ' + s;
    },
} as const;


