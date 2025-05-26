import { interMorphismRegistry } from '../registries.js';
import { NodeBase, GraphState } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import WebSocket from 'ws';

const openai = new OpenAI();

export class NodeDelta extends NodeBase<{ inputKeys: string[], outputKey: string, intraMorphism: string, outputDir: string, interMorphism: string }> {

    spec: {
        inputKeys: string[];
        outputKey: string;
        intraMorphism: string; // ATTENTION: should be packed with the outputKey
        outputDir: string;
        interMorphism: string;
    }

    constructor(spec: { inputKeys: string[], outputKey: string, intraMorphism: string, outputDir: string, interMorphism: string; }) {
        super();
        this.spec = spec;
    }

    async invoke(state: GraphState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<GraphState>> {

        if (!state.dryModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                ws.send(JSON.stringify({
                    node: 'NodeDelta',
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
                messages: [new AIMessage('NodeDelta completed in DryRun mode')],
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
                messages: [new AIMessage('NodeDelta completed')],
                metaResourceMap: {
                    ...(state.metaResourceMap ?? {}),
                    [this.spec.outputKey]: value,
                }
            };

        } catch (error: any) {
            console.error('Error in NodeDelta:', error);
            return {
                messages: [new AIMessage('NodeDelta failed')],
            };
        }

    }

}



