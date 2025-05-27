import { NodeBase, GraphState, Resource } from '../types.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
// import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';

interface TSpec {
    foo: string;
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

        const { repo, branch } = state;
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${state.graphFile.path}`;
        let graphFile = { ...state.graphFile };

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${url})`);
            }
            graphFile.content = await response.text();
        } catch (error) {
            throw new Error(`Error fetching or processing file: ${error}`);
        }

        return {
            graphFile
        };

    }

}
