import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { Annotation } from "@langchain/langgraph";
import { AIMessage } from '@langchain/core/messages';
import { NodeSpec, BaseStateSpec, registerNode } from "../../types.js";
import { OpenAI } from 'openai'; // ATTENTION: should use the langchain wrapper instead

const openai = new OpenAI();

export const NodeEvaluateResultsState = Annotation.Root({
    docking: Annotation<{ path: string, value: Map<string, any> }>({  // The key of the map should be a string holding a "row_identifier" and the value should be a custom data type that represents a PDBQT row.
        reducer: (prev, next) => next
    }),
    pose: Annotation<{ path: string, value: Map<string, any> }>({  // Key and value of map to be determined.
        reducer: (prev, next) => next
    }),
    evaluation: Annotation<{ path: string, value: string }>({ // The type of "value" should represent SMILES strings (if possible).
        reducer: (prev, next) => next
    }),
    shouldRetry: Annotation<boolean>({
        reducer: (prev, next) => next
    }),
});

type WithBaseState = typeof NodeEvaluateResultsState.State &
    ReturnType<typeof Annotation.Root<typeof BaseStateSpec>>["State"];


class _NodeEvaluateResults extends Runnable {

    static nodeSpec: NodeSpec = {
        name: 'NodeEvaluateResults',
        description: '',
        operations: [],
    }

    lc_namespace = []; // ATTENTION: Assigning an empty array for now to honor the contract with the Runnable class, which implements RunnableInterface.

    async invoke(state: WithBaseState, options?: Partial<RunnableConfig<Record<string, any>>>): Promise<Partial<WithBaseState>> {
        // Here we evaluate the results and decide whether to retry or not.
        try {
            if (!state.docking?.value || !state.pose?.value) {
                throw new Error("Missing ligandDocking or ligandPose data");
            }

            // Prepare the results content for OpenAI evaluation
            let resultsContent = "";

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
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Analyze the docking results and provide a detailed evaluation. Focus on binding affinity, interactions, and potential improvements."
                    },
                    {
                        role: "user",
                        content: `Please analyze these docking results:\n${resultsContent}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            });

            const evaluation = response.choices[0].message.content?.trim();
            if (!evaluation) {
                throw new Error("Failed to generate evaluation");
            }

            // Save evaluation to GCS
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const evaluationFileName = `evaluations/evaluation_${timestamp}.txt`;

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
                messages: [new AIMessage("Results evaluated")],
                shouldRetry: false,
                evaluation: {
                    path: evaluationFileName,
                    value: evaluation
                }
            };

        } catch (error: any) {
            console.error("Error in nodeEvaluateResults:", error);
            return {
                messages: [new AIMessage(`Error evaluating results: ${error.message}`)],
                shouldRetry: false
            };
        }
    }

}

export const NodeEvaluateResults = registerNode<typeof _NodeEvaluateResults>(_NodeEvaluateResults);



