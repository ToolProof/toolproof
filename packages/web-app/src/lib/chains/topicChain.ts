import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as Constants from 'shared/src/constants'

const TOPIC_DETECTION = 'topic_detection'; // ATTENTION: move to constants

const conceptModel = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.5,
});

const memory = new BufferMemory({
  returnMessages: true,
  inputKey: 'input',
  outputKey: 'output',
  memoryKey: 'history',
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ['system', `Your job is to detect the topic of the conversation based on the input message and the context.`],
  new MessagesPlaceholder('history'),
  ['human', `{speaker}: {input}`],
]);


const functionSchema = [
  {
    name: TOPIC_DETECTION,
    description: 'The purpose of this function is to detect the topic of the conversation based on the input message and the context.',
    parameters: zodToJsonSchema(
      z.object({
        topicDetected: z.string().describe('The detected topic'),
        action: z.enum([Constants.continue_topic, Constants.change_topic]).describe('Whether to continue the current topic or change to a new one'),
      })
    )
  },
];


const chain = RunnableSequence.from([
  {
    input: (initialInput) => initialInput.input,
    speaker: (initialInput) => initialInput.speaker,
    memory: () => memory.loadMemoryVariables({}),
  },
  {
    input: (previousOutput) => previousOutput.input,
    speaker: (previousOutput) => previousOutput.speaker,
    history: (previousOutput) => previousOutput.memory.history,
  },
  promptTemplate,
  /* (previousOutput) => {
    console.log(previousOutput);
    return previousOutput;
  }, */
  conceptModel.bind({
    functions: functionSchema,
    function_call: { name: TOPIC_DETECTION },
  }),
]);


const invokeChainWrapper = async ({ promptSeed, userName }: { conceptId: string; promptSeed: string; userName: string }) => {

  try {
    
    const inputs = {
      input: promptSeed,
      speaker: userName,
    };

    const response = await chain.invoke(inputs);

    
    if (response && response.additional_kwargs && response.additional_kwargs.function_call) { // ATTENTION: optional chaining

      const argsString = response.additional_kwargs.function_call.arguments;
      const argsInsecure = JSON.parse(argsString);
      const modelResponse = argsInsecure.modelResponse;
      const topicDetected = argsInsecure.topicDetected;
      const action = argsInsecure.action;

      await memory.saveContext(
        {
          input: promptSeed,
        }, { // ATTENTION
        output: modelResponse,
      });

      const argsSecure = {
        modelResponse: modelResponse,
        topicDetected: topicDetected,
        action: action,
      };
      console.log('argsSecure', argsSecure);

      return argsSecure;
    } else {
      // Handle the case when response is not as expected
      throw new Error('Received an unexpected response format from the chain invocation.');
    }
  } catch (error) {
    // Log the error or handle it as needed
    console.error('An error occurred during the query operation:', error);
    // You could return a default error message or rethrow the error depending on your error handling strategy
    throw error; // or return a default message like "An error occurred. Please try again."
  }
}

export default invokeChainWrapper;