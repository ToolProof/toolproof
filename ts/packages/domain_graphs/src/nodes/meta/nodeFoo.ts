import { NodeSpec, BaseStateSpec, registerNode } from '../../types.js';
import { extractNodeSpec } from '../../tools/meta/extractNodeSpec';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
// import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';


export const NodeFooState = Annotation.Root({
    repo: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'ToolProof/toolproof' },
        }
    ),
    branch: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'master' },
        }
    ),
    path: Annotation<string>(
        {
            reducer: (prev, next) => next,
            default: () => { return 'ts/packages/domain_graphs/src/graphs/meta/grafumilo.ts' },
        }
    ),
    graph: Annotation<{
        path: string,
        content: string,
    }>(),
    nodes: Annotation<{
        path: string,
        content: Record<string, any>,
    }[]>,
});

type WithBaseState = typeof NodeFooState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeFoo extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeFoo',
        description: '',
        operations: [
            {
                direction: 'write',
                storage: 'private',
                resources: []
            }
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        /* if (state.dryRunModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                console.log('Connected to WebSocket server (DryRun)');
                ws.send(JSON.stringify({
                    node: 'NodeFoo',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeFoo completed in DryRun mode')],
            };
        } */

        const { repo, path, branch } = state;
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
        let graph = { path, content: '' };
        let nodes: { path: string, content: Record<string, any> }[] = [];

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
            }
            const fileContent = await response.text();
            graph.content = fileContent;

            const importMatches = fileContent.matchAll(/import\s+.*?from\s+['"][^'"]*(nodes\/[^'"]*)['"]/g);

            for (const match of importMatches) {
                const _importPath = 'ts/packages/domain_graphs/src' + match[1];
                const importPath = _importPath.replace(/\.js$/, '.ts');
                const importUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${importPath}`;

                const importResponse = await fetch(importUrl);
                if (importResponse.ok) {
                    const importedContent = await importResponse.text();
                    const nodeSpecString = extractNodeSpec(importedContent);

                    if (nodeSpecString) {
                        try {
                            console.log('nodeSpecString:', nodeSpecString);
                            const cleanedNodeSpec = nodeSpecString.replace(/static\s+nodeSpec\s*:\s*NodeSpec\s*=\s*/, '').replace(/;$/, '');
                            const nodeSpecObject = eval(`(${cleanedNodeSpec})`);
                            nodes.push({ path: importPath, content: nodeSpecObject });
                        } catch (jsonError) {
                            throw new Error(`1: Error parsing nodeSpec JSON: ${jsonError}`);
                            // nodes.push({ path: importPath, content: `Error parsing nodeSpec JSON: ${jsonError}` });
                        }
                    } else {
                        throw new Error(`2: Error parsing nodeSpec JSON`);
                        // nodes.push({ path: importPath, content: "No nodeSpec found in the file." });
                    }
                } else {
                    const msg = `Failed to fetch: ${importResponse.status} ${importResponse.statusText}`;
                    console.error(`${msg} — URL: ${importUrl}`);
                    throw new Error(`3: Error parsing nodeSpec JSON`);
                    // nodes.push({ path: importPath, content: `Failed to fetch: ${importResponse.statusText}` });
                }
            }

        } catch (error) {
            throw new Error(`Error fetching or processing file: ${error}`);
        }

        return {
            graph,
            nodes,
        };

    }

}


export const NodeFoo = registerNode<typeof _NodeFoo>(_NodeFoo);