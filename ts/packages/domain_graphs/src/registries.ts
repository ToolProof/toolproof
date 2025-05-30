import { GraphSpec_ToolProof, _GraphSpec_ToolProof } from 'shared/src/types.js';
import { parse } from '@babel/parser';
const traverseModule = await import('@babel/traverse');
const traverse = traverseModule.default;
import generate from '@babel/generator';
import * as t from '@babel/types';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead


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
    doNothing: async () => {
        return (s: string) => s;
    },
    chunkPDBContent: async () => {
        const { chunkPDBContent } = await import('./tools/chunkPDBContent.js');
        return chunkPDBContent; // assume: (s: string) => ChunkInfo[]
    },
    ghi: async () => {
        return (sourceCode: string) => {
            const ast = parse(sourceCode, {
                sourceType: 'module',
                plugins: ['typescript'], // or 'jsx' if JSX used
            });

            const addNodes: { nodeName: string; argsText: string }[] = [];

            traverse(ast, {
                CallExpression(path) {
                    const callee = path.node.callee;
                    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property) && callee.property.name === 'addNode') {
                        const args = path.node.arguments;
                        if (args.length >= 2 && t.isStringLiteral(args[0])) {
                            const nodeName = args[0].value;
                            const argsText = sourceCode.slice(args[0].start!, path.node.end!);
                            addNodes.push({ nodeName, argsText });
                        }
                    }
                },
            });


            const toolProofSpecs: _GraphSpec_ToolProof[] = [];

            for (const { nodeName, argsText } of addNodes) {
                try {
                    const cleanedArgsText = argsText.trim().replace(/\)*$/, '');
                    const wrappedCode = `dummyFn(${cleanedArgsText});`;

                    const innerAst = parse(wrappedCode, {
                        sourceType: 'module',
                        plugins: ['typescript'],
                    });

                    let interMorphism: string | null = null;

                    traverse(innerAst, {
                        ObjectProperty(path) {
                            const key = path.node.key;
                            if (
                                t.isIdentifier(key, { name: 'interMorphism' }) &&
                                t.isStringLiteral(path.node.value)
                            ) {
                                interMorphism = path.node.value.value;
                                path.stop();
                            }
                        },
                    });

                    console.log(`[${nodeName}] interMorphism:`, interMorphism);

                    toolProofSpecs.push({
                        name: nodeName,
                        tools: interMorphism ? [interMorphism] : [],
                    });

                } catch (error) {
                    console.error(`Failed to process node ${nodeName}:`, error);
                }

            }

            const graphSpec: GraphSpec_ToolProof = {
                spec: toolProofSpecs,
            };
            return graphSpec;
        };
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
        return (docking: string, pose: string) => false;
    },
} as const;


