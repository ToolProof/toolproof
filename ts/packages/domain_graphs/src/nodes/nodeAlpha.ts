import { NodeBase, GraphState } from '../types.js';
import { intraMorphismRegistry } from '../registries.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

interface TSpec {
    inputKeys: string[];
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

            if (!this.spec.inputKeys.includes(key)) {
                console.log('Skipping resource:', key);
                continue;
            } else {
                console.log('Processing resource:', key);
            }

            const resource = state.resourceMap[key];

            try {
                // ATTENTION: consider abstracting this fetch logic to a utility morphism
                const response = await fetch(resource.path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file from GitHub: ${response.statusText} (URL: ${resource.path})`);
                }

                const content = await response.text();

                const intraMorphism = resource.intraMorphism;

                const loader = intraMorphismRegistry[intraMorphism as keyof typeof intraMorphismRegistry]; // ATTENTION
                if (!loader) throw new Error(`Unknown morphism: ${intraMorphism}`);

                const fn = await loader(); // Load actual function
                const value = await fn(content); // Call function

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
