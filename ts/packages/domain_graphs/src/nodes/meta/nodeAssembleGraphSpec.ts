import { GraphSpec_ToolProof, _GraphSpec_ToolProof } from 'shared/src/types.js';
import { NodeSpec, BaseStateSpec, registerNode } from '../../types.js';
import { extractNodeSpec } from '../../tools/meta/extractNodeSpec.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
// import { AIMessage } from '@langchain/core/messages';
// import WebSocket from 'ws';


export const NodeAssembleGraphSpecState = Annotation.Root({
    nodeFiles: Annotation<{
        path: string,
        content: string,
    }[]>,
    graphSpec: Annotation<GraphSpec_ToolProof>,
});

type WithBaseState = typeof NodeAssembleGraphSpecState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];

class _NodeAssembleGraphSpec extends Runnable {

    static nodeSpec: NodeSpec = {
        description: '',
        operations: [
            {
                kind: 'StorageOperation',
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
                    node: 'NodeAssembleGraphSpec',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeAssembleGraphSpec completed in DryRun mode')],
            };
        } */

        let nodeSpecs: _GraphSpec_ToolProof[] = [];

        for (const nodeFile of state.nodeFiles) {

            const regex = /class\s+_Node([A-Za-z0-9_]+)\s+extends\s+Runnable/;
            const classNameMatch = nodeFile.content.match(regex);

            const nodeSpecString = extractNodeSpec(nodeFile.content);

            if (classNameMatch && nodeSpecString) {
                try {
                    console.log('nodeSpecString:', nodeSpecString);
                    const cleanedNodeSpec = nodeSpecString.replace(/static\s+nodeSpec\s*:\s*NodeSpec\s*=\s*/, '').replace(/;$/, '');
                    const nodeSpecObject = eval(`(${cleanedNodeSpec})`);
                    const tools: string[] = (nodeSpecObject.operations || [])
                        // eslint-disable-next-line
                        .filter((operation: any) => operation.kind === 'ToolInvocation')
                        // eslint-disable-next-line
                        .map((operation: any) => operation.name);
                    nodeSpecs.push({
                        name: classNameMatch[1],
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
                spec: nodeSpecs,
            },
        };

    }

}


export const NodeAssembleGraphSpec = registerNode<typeof _NodeAssembleGraphSpec>(_NodeAssembleGraphSpec);