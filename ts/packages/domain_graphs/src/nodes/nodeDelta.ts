import { NodeBase, GraphState, ResourceMap } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';


interface TSpec {
    inputs: {
        key: string;
        path: string;
    }[]
}

export class NodeDelta extends NodeBase<TSpec> {

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

            const resourceMapAugmentedWithPath: ResourceMap = {};

            for (const inputSpec of this.spec.inputs) {
                const value = state.resourceMap[inputSpec.key].value;

                const timestamp = new Date().toISOString();
                const outputPath = inputSpec.path.replace('timestamp', timestamp);

                await storage
                    .bucket(bucketName)
                    .file(outputPath)
                    .save(value, {
                        contentType: 'text/plain',
                    });

                resourceMapAugmentedWithPath[inputSpec.key] = {
                    ...state.resourceMap[inputSpec.key],
                    path: `${outputPath}`,
                };
            }

            return {
                messages: [new AIMessage('NodeDelta completed')],
                resourceMap: {
                    ...state.resourceMap,
                    ...resourceMapAugmentedWithPath,
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



