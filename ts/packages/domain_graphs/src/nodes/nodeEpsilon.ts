import { NodeBase, GraphState } from '../types.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';

import { parse } from '@babel/parser';
const traverseModule = await import('@babel/traverse');
const traverse = traverseModule.default;
import * as t from '@babel/types';

interface TSpec {
    inputKeys: string[];
}

export class NodeEpsilon extends NodeBase<TSpec> {

    spec: TSpec;

    constructor(spec: TSpec) {
        super();
        this.spec = spec;
    }

    async invoke(state: GraphState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<GraphState>> {

        /* if (state.dryModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryModeManager.delay));

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                console.log('Connected to WebSocket server (DryRun)');
                ws.send(JSON.stringify({
                    node: 'NodeLoadGraphFile',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeLoadGraphFile completed in DryRun mode')],
            };
        } */

        const resourceMap = state.resourceMap;

        for (const key of Object.keys(state.resourceMap)) {

            if (!this.spec.inputKeys.includes(key)) {
                console.log('Skipping resource:', key);
                continue;
            } else {
                console.log('Processing resource:', key);
            }

            const resource = state.resourceMap[key];

            const url = `https://raw.githubusercontent.com/${resource.path}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
                }

                const sourceCode = await response.text();

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


                resource.value = ast; // ATTENTION: should use resource.intraMorphism
                resourceMap[key] = resource; // ATTENTION: mutates resourceMap directly
            } catch (error) {
                throw new Error(`Error fetching or processing file: ${error}`);
            }

        }

        return {
            messages: [new AIMessage('NodeEpsilon completed')],
            resourceMap,
        };

    }

}
