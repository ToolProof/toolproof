import { NodeBase, GraphState } from '../types.js';
import { intraMorphismRegistry, fetchRegistry } from '../registries/registries.js';
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
                const intraMorphism_0 = resource.intraMorphisms[0];
                const loader_0 = fetchRegistry[intraMorphism_0 as keyof typeof fetchRegistry];
                if (!loader_0) throw new Error(`Unknown morphism:`);
                const fn_0 = await loader_0();
                const content = await fn_0(resource.path);

                const intraMorphism_1 = resource.intraMorphisms[1];
                const loader_1 = intraMorphismRegistry[intraMorphism_1 as keyof typeof intraMorphismRegistry]; // ATTENTION
                if (!loader_1) throw new Error(`Unknown morphism: ${intraMorphism_1}`);
                const fn_1 = await loader_1();
                const value = await fn_1(content);

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
