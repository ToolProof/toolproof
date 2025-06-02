import { NodeBase, GraphState } from '../types.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

interface TSpec {
    inputs: {
        key: string;
        intraMorphisms: {
            fetch: (url: string) => Promise<string>;
            transform: (content: string) => any | Promise<any>; // ATTENTION
        }
    }[];
}

export class NodeAlpha extends NodeBase<TSpec> {

    spec: TSpec;

    constructor(spec: TSpec) {
        super();
        this.spec = spec;
    }

    async invoke(state: GraphState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<GraphState>> {

        if (!state.dryModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('https://service-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    node: 'NodeAlpha',
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });
        }

        if (state.dryModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryModeManager.delay));

            return {
                messages: [new AIMessage('NodeAlpha completed in DryRun mode')],
            };
        }

        const resourceMap = state.resourceMap;

        for (const key of Object.keys(state.resourceMap)) {

            if (!this.spec.inputs.map((input) => input.key).includes(key)) {
                console.log('Skipping resource:', key);
                continue;
            } else {
                console.log('Processing resource:', key);
            }

            const intraMorphisms = this.spec.inputs.find((input) => input.key === key)?.intraMorphisms;
            if (!intraMorphisms) {
                throw new Error(`No intraMorphisms defined for key: ${key}`);
            }

            const resource = state.resourceMap[key];

            try {
                const content = await intraMorphisms.fetch(resource.path);
                const value = await intraMorphisms.transform(content);

                resource.value = value;
                resourceMap[key] = resource;
            } catch (error) {
                throw new Error(`Error fetching or processing file: ${error}`);
            }

        }

        return {
            messages: [new AIMessage('NodeAlpha completed')],
            resourceMap,
        };

    }

}
