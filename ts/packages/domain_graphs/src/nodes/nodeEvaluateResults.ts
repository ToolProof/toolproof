import { NodeSpec, BaseStateSpec, registerNode } from '../types.js';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead
import WebSocket from 'ws';

const openai = new OpenAI();

export const NodeEvaluateResultsState = Annotation.Root({
    docking: Annotation<{ path: string, value: Map<string, any> }>(),
    pose: Annotation<{ path: string, value: Map<string, any> }>(),
    evaluation: Annotation<{ path: string, value: string }>(),
    shouldRetry: Annotation<boolean>({
        reducer: (prev, next) => next,
        default: () => false,
    }),
});

type WithBaseState = typeof NodeEvaluateResultsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>['State'];


class _NodeEvaluateResults extends Runnable {

    static nodeSpec: NodeSpec = {
        description: '',
        operations: [
            {
                direction: 'write',
                storage: 'private',
                resources: []
            },
        ],
    };

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {

        if (state.dryRunModeManager.dryRunMode) {
            await new Promise(resolve => setTimeout(resolve, state.dryRunModeManager.delay));

            // Connect to WebSocket server
            const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

            ws.on('open', () => {
                console.log('Connected to WebSocket server (DryRun)');
                ws.send(JSON.stringify({
                    node: 'NodeEvaluateResults',
                    message: 'Completed DryRun Mode'
                }));
                ws.close();
            });

            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            return {
                messages: [new AIMessage('NodeEvaluateResults completed in DryRun mode')],
            };
        }


        // Here we evaluate the results and decide whether to retry or not.
        try {
            /* if (!state.docking?.value || !state.pose?.value) {
                throw new Error('Missing docking or pose data');
            }

            // Prepare the results content for OpenAI evaluation
            let resultsContent = '';

            const dockingContent = state.docking.value.get('content');
            const poseContent = state.pose.value.get('content');

            if (dockingContent) {
                resultsContent += `Docking Result:\n${dockingContent}\n\n`;
            }

            if (poseContent) {
                resultsContent += `Pose Result:\n${poseContent}\n\n`;
            }

            // Evaluate results using OpenAI
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze the docking results and provide a detailed evaluation. Focus on binding affinity, interactions, and potential improvements.'
                    },
                    {
                        role: 'user',
                        content: `Please analyze these docking results:\n${resultsContent}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });

            const evaluation = response.choices[0].message.content?.trim();
            if (!evaluation) {
                throw new Error('Failed to generate evaluation');
            }

            // Save evaluation to GCS
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const evaluationFileName = `evaluations/evaluation_${timestamp}.txt`; */

            // await storage
            //     .bucket(bucketNameData)
            //     .file(evaluationFileName)
            //     .save(evaluation, {
            //         contentType: 'text/plain',
            //         metadata: {
            //             createdAt: timestamp,
            //             type: 'evaluation'
            //         }
            //     });

            // console.log(`Evaluation saved to gs://tp_data/${evaluationFileName}`);


            return {
                messages: [new AIMessage('NodeEvaluateResults completed')],
                shouldRetry: false,
                /* evaluation: {
                    path: evaluationFileName,
                    value: evaluation
                } */
            };

        } catch (error: any) {
            console.error('Error in NodeEvaluateResults:', error);
            return {
                messages: [new AIMessage('NodeEvaluateResults failed')],
                shouldRetry: false
            };
        }
    }

}

export const NodeEvaluateResults = registerNode<typeof _NodeEvaluateResults>(_NodeEvaluateResults);



