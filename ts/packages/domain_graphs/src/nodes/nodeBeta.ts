import { interMorphismRegistry } from '../registries/registries.js';
import { NodeBase, GraphState, Resource } from '../types.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';


interface TSpec {
    inputKeys: string[];
    outputSpec: Resource & { outputKey: string, intraMorphisms: string[] }; // ATTENTION: allows for only a single output resource
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
                if (this.spec.inputKeys.includes(key)) {
                    inputs.push(resource.value);
                }
            });

            const loader = interMorphismRegistry[this.spec.interMorphism as keyof typeof interMorphismRegistry];
            if (!loader) throw new Error(`Unknown morphism: ${this.spec.interMorphism}`);

            const fn = await loader() as (...args: any[]) => string;
            const value = await fn(...inputs); // ATTENTION: is the type misleading?

            return {
                messages: [new AIMessage('NodeBeta completed')],
                resourceMap: {
                    ...state.resourceMap,
                    [this.spec.outputSpec.outputKey]: {
                        path: '',
                        value: value, // ATTENTION: should be taken through intraMorphism
                    },
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



