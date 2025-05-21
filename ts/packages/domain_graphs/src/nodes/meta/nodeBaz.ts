import { NodeSpec, BaseStateSpec, registerNode } from '../../types.js';
import { extractNodeSpec } from '../../tools/meta/extractNodeSpec';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
// import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';


export const NodeBazState = Annotation.Root({
    nodeFiles: Annotation<{
        path: string,
        content: string,
    }[]>,
    graphSpec: Annotation<{
        spec: { // ATTENTION
            name: string,
            tools: string[],
        }[],
    }>,
});

type WithBaseState = typeof NodeBazState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeBaz extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeBaz',
        description: '',
        operations: [
            {
                direction: 'write',
                storage: 'private',
                resources: []
            }
        ]
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        /* if (state.dryRunModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                console.log('Connected to WebSocket server (DryRun)');
                ws.send(JSON.stringify({
                    node: 'NodeBaz',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeBaz completed in DryRun mode')],
            };
        } */


        let foo: { name: string, tools: string[] }[] = [];

        for (const nodeFile of state.nodeFiles) {
            const nodeSpecString = extractNodeSpec(nodeFile.content);

            if (nodeSpecString) {
                try {
                    console.log('nodeSpecString:', nodeSpecString);
                    const cleanedNodeSpec = nodeSpecString.replace(/static\s+nodeSpec\s*:\s*NodeSpec\s*=\s*/, '').replace(/;$/, '');
                    const nodeSpecObject = eval(`(${cleanedNodeSpec})`);
                    const tools: string[] = (nodeSpecObject.operations || [])
                        // eslint-disable-next-line
                        .filter((operation: any) => typeof operation.name === 'string')
                        // eslint-disable-next-line
                        .map((operation: any) => operation.name);
                    foo.push({
                        name: nodeSpecObject.name,
                        tools: tools,
                    });
                    console.log('nodeSpecObject:', nodeSpecObject);
                } catch (jsonError) {
                    throw new Error(`1: Error parsing nodeSpec JSON: ${jsonError}`);
                    // nodes.push({ path: importPath, content: `Error parsing nodeSpec JSON: ${jsonError}` });
                }
            } else {
                throw new Error(`2: Error parsing nodeSpec JSON`);
                // nodes.push({ path: importPath, content: "No nodeSpec found in the file." });
            }
        }

        return {
            graphSpec: {
                spec: foo,
            },
        };

    }

}


export const NodeBaz = registerNode<typeof _NodeBaz>(_NodeBaz);