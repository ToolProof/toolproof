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
  ["system", ``],
  new MessagesPlaceholder("history"),
  ["human", `{speaker}: {input}`],
]);


const functionSchema = [
  {
    name: "test_function",
    description: "",
    parameters: zodToJsonSchema(
      z.object({
        modelResponse: z.string().describe("The model's response"),
        action: z.enum([Constants.CONTINUE_CHAT, Constants.CREATE_NEW_CHAT, Constants.BACK_TO_PARENT]).describe("The action to be taken"),
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
    function_call: { name: "test_function" },
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
    if (response && response.additional_kwargs && response.additional_kwargs.function_call) {

      const argsString = response.additional_kwargs.function_call.arguments;
      const argsInsecure = JSON.parse(argsString);
      let modelResponse = argsInsecure.modelResponse;
      const action = argsInsecure.action;

      if (!modelResponse || action !== Constants.CONTINUE_CHAT) {
        console.log("modelResponse", modelResponse);
        console.log("action", action);
        modelResponse = action;
      }

      await memory.saveContext(
        {
          input: promptSeed,
        }, { //ATTENTION
        output: modelResponse,
      });

      const argsSecure = {
        modelResponse: modelResponse,
        action: action,
      };

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

