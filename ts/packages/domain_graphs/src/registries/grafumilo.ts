import { GraphSpec_ToolProof, _GraphSpec_ToolProof } from 'shared/src/types.js';
import { parse } from '@babel/parser';
const traverseModule = await import('@babel/traverse');
const traverse = traverseModule.default;
import generate from '@babel/generator';
import * as t from '@babel/types';


export const intraMorphismRegistry = {
    getNodeInvocationsFromSourceCode: (sourceCode: string) => {
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
    },
    getCandidates: (content: string): { spec: string[] } => {
        return {
            spec: content
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0)
        }
    },
} as const;


export const interMorphismRegistry = {

} as const;