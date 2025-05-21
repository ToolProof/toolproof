import { NodeSpec, BaseStateSpec, registerNode } from '../../types.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
// import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';


export const NodeLoadNodeFilesState = Annotation.Root({
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
    graphFile: Annotation<{
        path: string,
        content: string,
    }>,
    nodeFiles: Annotation<{
        path: string,
        content: string,
    }[]>,
});

type WithBaseState = typeof NodeLoadNodeFilesState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeLoadNodeFiles extends Runnable {

    static nodeSpec: NodeSpec = {
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
                    node: 'NodeLoadNodeFiles',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeLoadNodeFiles completed in DryRun mode')],
            };
        } */

        const { repo, branch } = state;
        let nodeFiles: { path: string, content: string }[] = [];

        try {

            const importMatches = state.graphFile.content.matchAll(/import\s+.*?from\s+['"][^'"]*(nodes\/[^'"]*)['"]/g);

            for (const match of importMatches) {
                const _importPath = 'ts/packages/domain_graphs/src/' + match[1];
                const importPath = _importPath.replace(/\.js$/, '.ts');
                const importUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${importPath}`;

                const importResponse = await fetch(importUrl);
                if (importResponse.ok) {
                    const importedContent = await importResponse.text();
                    nodeFiles.push({ path: importPath, content: importedContent });
                } else {
                    const msg = `Failed to fetch: ${importResponse.status} ${importResponse.statusText}`;
                    console.error(`${msg} — URL: ${importUrl}`);
                    throw new Error(`Error fetching file: ${msg}`);
                    // nodes.push({ path: importPath, content: `Failed to fetch: ${importResponse.statusText}` });
                }
            }
        } catch (error) {
            throw new Error(`Error fetching or processing file: ${error}`);
        }
        return {
            nodeFiles
        };
    }

}


export const NodeLoadNodeFiles = registerNode<typeof _NodeLoadNodeFiles>(_NodeLoadNodeFiles);