import { NodeBase, GraphState } from '../types.js';
import { intraMorphismRegistry, fooRegistry } from '../registries/registries.js';
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
                const loader_1 = fooRegistry['fetchContentFromUrl']; // ATTENTION: hardcoded
                if (!loader_1) throw new Error(`Unknown morphism:`);
                const fn_1 = await loader_1();
                const content = await fn_1(resource.path);

                const intraMorphism = resource.intraMorphism;

                const loader_2 = intraMorphismRegistry[intraMorphism as keyof typeof intraMorphismRegistry]; // ATTENTION
                if (!loader_2) throw new Error(`Unknown morphism: ${intraMorphism}`);
                const fn_2 = await loader_2();
                const value = await fn_2(content);

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
