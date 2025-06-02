import { NodeBase, GraphState } from '../types.js';
import { intraMorphismRegistry, fetchRegistry } from '../registries/registries.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

interface TSpec {
    inputs: {
        key: string;
        intraMorphisms: {
            fetch: string;
            transform: string;
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
                const loaderFetch = fetchRegistry[intraMorphisms.fetch as keyof typeof fetchRegistry];
                if (!loaderFetch) throw new Error(`Unknown morphism: ${intraMorphisms.fetch}`);
                const fnFetch = await loaderFetch();
                const content = await fnFetch(resource.path);

                const loaderTransform = intraMorphismRegistry[intraMorphisms.transform as keyof typeof intraMorphismRegistry]; // ATTENTION
                if (!loaderTransform) throw new Error(`Unknown morphism: ${intraMorphisms.transform}`);
                const fnTransform = await loaderTransform();
                const value = await fnTransform(content);

                resource.value = value; // ATTENTION: should use resource.intraMorphism
                resourceMap[key] = resource; // ATTENTION: mutates resourceMap directly
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
