import { NodeBase, GraphState, ResourceMap } from '../types.js';
import { storage, bucketName } from '../firebaseAdminInit.js';
import { RunnableConfig } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import WebSocket from 'ws';


interface TSpec {
    inputSpecs: {
        key: string;
        path: string;
    }[]
}

export class NodeEpsilon extends NodeBase<TSpec> {

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
                    node: 'NodeEpsilon',
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
                messages: [new AIMessage('NodeEpsilon completed in DryRun mode')],
            };
        }

        try {

            const resourceMapAugmentedWithPath: ResourceMap = {};

            this.spec.inputSpecs.forEach(async (inputSpec) => {

                const value = state.resourceMap[inputSpec.key].value;

                const timestamp = new Date().toISOString();
                const outputPath = inputSpec.path.replace('timestamp', timestamp);
                // ATTENTION: consider passing a piece of logic to generate outputPath

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
            })

            return {
                messages: [new AIMessage('NodeEpsilon completed')],
                resourceMap: {
                    ...state.resourceMap,
                    ...resourceMapAugmentedWithPath,
                }
            };
        } catch (error: any) {
            console.error('Error in NodeEpsilon:', error);
            return {
                messages: [new AIMessage('NodeEpsilon failed')],
            };
        }

    }

}



