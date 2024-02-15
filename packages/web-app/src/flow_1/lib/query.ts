import { ChatOpenAI } from "@langchain/openai";
//import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
//import { AIMessage, HumanMessage } from "langchain/schema";
//import dbAdmin from "../../configFirebaseAdmin";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as Constants from "shared/src/flow_0/constants"

const TOPIC_DETECTION = "topic_detection"; //ATTENTION: move to constants

let currentChatId: string = "";

const chatModel = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0.5,
});

let memory = new BufferMemory({
  returnMessages: true,
  inputKey: "input",
  outputKey: "output",
  memoryKey: "history",
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `Your job is to keep the conversation going and keep track of the topic.`],
  new MessagesPlaceholder("history"),
  ["human", `{speaker}: {input}`],
]);


const functionSchema = [
  {
    name: TOPIC_DETECTION,
    description: "The purpose of this function is to detect the topic of the conversation based on the input message and the current context.",
    parameters: zodToJsonSchema(
      z.object({
        modelResponse: z.string().describe("The model's response"),
        topicDetected: z.string().describe("The detected topic"),
        action: z.enum([Constants.CONTINUE_TOPIC, Constants.CHANGE_TOPIC]).describe("The action to be taken"),
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
  chatModel.bind({
    functions: functionSchema,
    function_call: { name: TOPIC_DETECTION },
  }),
]);


const query = async ({ chatId, promptSeed, userName }: { chatId: string; promptSeed: string; userName: string }) => {

  try {
    // Check if a new chat has started or the existing one continues
    if (currentChatId !== chatId) {
      /*
      const messagesSnapshot = await dbAdmin //ATTENTION_
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .get();

      const pastMessages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.userId === "ChatGPT" ?
          new AIMessage(data.content) :
          new HumanMessage(data.content);
      });

      const chatHistory = new ChatMessageHistory(pastMessages);
      */
      memory = new BufferMemory({
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
        memoryKey: "history",
        //chatHistory: chatHistory,
      });

      currentChatId = chatId;
    }

    const inputs = {
      input: promptSeed,
      speaker: userName,
    };

    const response = await chain.invoke(inputs);

    // It's important to check if the response is successful before attempting to save the context
    if (response && response.additional_kwargs && response.additional_kwargs.function_call) { //ATTENTION: optional chaining

      const argsString = response.additional_kwargs.function_call.arguments;
      const argsInsecure = JSON.parse(argsString);
      const modelResponse = argsInsecure.modelResponse;
      const topicDetected = argsInsecure.topicDetected;
      const action = argsInsecure.action;

      /* if (!modelResponse || action !== Constants.CONTINUE_TOPIC) {
        console.log("modelResponse", modelResponse);
        console.log("action", action);
        modelResponse = action;
      } */

      await memory.saveContext(
        {
          input: promptSeed,
        }, { //ATTENTION
        output: modelResponse,
      });

      const argsSecure = {
        modelResponse: modelResponse,
        topicDetected: topicDetected,
        action: action,
      };
      console.log("argsSecure", argsSecure);

      return argsSecure;
    } else {
      // Handle the case when response is not as expected
      throw new Error("Received an unexpected response format from the chain invocation.");
    }
  } catch (error) {
    // Log the error or handle it as needed
    console.error("An error occurred during the query operation:", error);
    // You could return a default error message or rethrow the error depending on your error handling strategy
    throw error; // or return a default message like "An error occurred. Please try again."
  }
}

export default query;

