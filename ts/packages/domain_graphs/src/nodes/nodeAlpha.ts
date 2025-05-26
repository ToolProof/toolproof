import { intraMorphismRegistry } from '../registries.js';
import { NodeBase, GraphState } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';


export class NodeAlpha extends NodeBase<{ inputKeys: string[]; }> {

    spec: {
        inputKeys: string[];
    }

    constructor(spec: { inputKeys: string[]; }) {
        super();
        this.spec = spec;
    }

    async invoke(state: GraphState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<GraphState>> {

        if (!state.dryModeManager.drySocketMode) {

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

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

        try {

            const resourceMap = state.resourceMap;

            for (const key of Object.keys(state.resourceMap)) {

                if (!this.spec.inputKeys.includes(key)) {
                    console.log('Skipping resource:', key);
                    continue;
                } else {
                    console.log('Processing resource:', key);
                }

                const resource = state.resourceMap[key];
                const path = resource.path;

                try {
                    const [content] = await storage
                        .bucket(bucketName)
                        .file(path)
                        .download();

                    const contentStringified = content.toString();

                    const intraMorphism = resource.intraMorphism;

                    const loader = intraMorphismRegistry[intraMorphism as keyof typeof intraMorphismRegistry]; // ATTENTION
                    if (!loader) throw new Error(`Unknown morphism: ${intraMorphism}`);

                    const fn = await loader(); // Load actual function
                    const value = await fn(contentStringified); // Call function

                    resourceMap[key] = {
                        ...resource,
                        value,
                    }

                } catch (downloadError: any) {
                    throw new Error(`Error while processing: ${downloadError.message}`);
                }
            }

            return {
                messages: [new AIMessage('NodeAlpha completed')],
                resourceMap,
            };

        } catch (error: any) {
            console.error('Error in NodeAlpha:', error);
            return {
                messages: [new AIMessage('NodeAlpha failed')],
            };
        }

    }

}