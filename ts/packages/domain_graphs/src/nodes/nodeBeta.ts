import { interMorphismRegistry } from '../registries/registries.js';
import { NodeBase, GraphState, ResourceMap } from '../types.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';

interface TSpec {
    inputs: string[];
    outputs: { key: string, intraMorphisms: string[] }[];
    interMorphism: string;
}

export class NodeBeta extends NodeBase<TSpec> {

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
                    node: 'NodeBeta',
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
                messages: [new AIMessage('NodeBeta completed in DryRun mode')],
            };
        }

        try {

            const inputs: any[] = [];

            Object.entries(state.resourceMap).forEach(([key, resource]) => {
                if (this.spec.inputs.includes(key)) {
                    inputs.push(resource.value);
                }
            });

            const loader = interMorphismRegistry[this.spec.interMorphism as keyof typeof interMorphismRegistry];
            if (!loader) throw new Error(`Unknown morphism: ${this.spec.interMorphism}`);

            const fn = await loader() as (...args: any[]) => string;
            const value: any[] = await fn(...inputs); // ATTENTION: value should be a tuple of the same length as this.spec.outputs? Or maybe use keys instead of indices? #StructuredOutputs

            const extraResources: ResourceMap = this.spec.outputs.reduce((acc, output, i) => {
                acc[output.key] = {
                    path: '',
                    value: value[i], // ATTENTION: should be taken through intraMorphism(s)
                }
                return acc;
            }, {} as ResourceMap);




            return {
                messages: [new AIMessage('NodeBeta completed')],
                resourceMap: {
                    ...state.resourceMap,
                    ...extraResources,
                }
            };
        } catch (error: any) {
            console.error('Error in NodeBeta:', error);
            return {
                messages: [new AIMessage('NodeBeta failed')],
            };
        }
    }

}



