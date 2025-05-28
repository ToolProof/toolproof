import { interMorphismRegistry } from '../registries.js';
import { NodeBase, GraphState, Resource } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import WebSocket from 'ws';

const openai = new OpenAI();

interface TSpec {
    inputKeys: string[];
    outputSpec: Resource & { outputKey: string }; // ATTENTION: allows for only a sinle output resource
    interMorphism: string;
    writeToPrivate: boolean;
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

            try {

                const timestamp = new Date().toISOString();
                const outputPath = this.spec.outputSpec.path.replace('timestamp', timestamp);
                // ATTENTION: consider passing a piece of logic to generate outputPath

                await storage
                    .bucket(bucketName)
                    .file(outputPath)
                    .save(value, {
                        contentType: 'text/plain',
                        metadata: {
                            createdAt: timestamp,
                        }
                    });

                return {
                    messages: [new AIMessage('NodeBeta completed')],
                    resourceMap: this.spec.writeToPrivate ? {
                        ...state.resourceMap,
                        [this.spec.outputSpec.outputKey]: {
                            path: `${outputPath}`,
                            intraMorphism: this.spec.outputSpec.intraMorphism,
                            value: value, // ATTENTION: should be taken through intraMorphism
                        },
                    }
                        : state.resourceMap,
                };

            } catch (error: any) {
                console.error('Error in NodeBeta:', error);
                return {
                    messages: [new AIMessage('NodeBeta failed')],
                };
            }

        } catch (error: any) {
            console.error('Error in NodeBeta:', error);
            return {
                messages: [new AIMessage('NodeBeta failed')],
            };
        }

    }

}



