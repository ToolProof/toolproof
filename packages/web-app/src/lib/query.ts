import { ChatOpenAI } from "langchain/chat_models/openai";
//import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
//import { AIMessage, HumanMessage } from "langchain/schema";
//import dbAdmin from "../../configFirebaseAdmin";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as Constants from "../setup/definitions/constants"

let currentConversationId: string = "";

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
  ["system", `You are a conversation orchestrator. Try to best accomodate the user's wishes or keep the current conversation going.`],
  new MessagesPlaceholder("history"),
  ["human", `{input}`],
]);


const functionSchema = [
  {
    name: "conversation_orchestration",
    description: "An instance of conversation orchestration",
    parameters: zodToJsonSchema(
      z.object({
        modelResponse: z.string().describe("The model's response"),
        action: z.enum([Constants.continue_conversation, Constants.create_new_conversation, Constants.back_to_parent]).describe("The action to be taken"),
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
  (previousOutput) => {
    //console.log(previousOutput);
    return previousOutput;
  },
  chatModel.bind({
    functions: functionSchema,
    function_call: { name: "conversation_orchestration" },
  }),
]);



const query = async (prompt: string, user: string, conversationId: string, isAlfa: boolean) => {

  try {
    // Check if a new conversation has started or the existing one continues
    if (currentConversationId !== conversationId) {
      /*
      const messagesSnapshot = await dbAdmin
        .collection("conversations")
        .doc(conversationId)
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

      currentConversationId = conversationId;
    }

    const inputs = {
      input: prompt,
      //speaker: user,
    };

    if (isAlfa) {
      const response = await chain.invoke(inputs);

      // It's important to check if the response is successful before attempting to save the context
      if (response && response.additional_kwargs && response.additional_kwargs.function_call) {

        const argsString = response.additional_kwargs.function_call.arguments;
        const argsInsecure = JSON.parse(argsString);
        let modelResponse = argsInsecure.modelResponse;
        const action = argsInsecure.action;

        if (!modelResponse || action !== Constants.continue_conversation) {
          console.log("modelResponse", modelResponse);
          console.log("action", action);
          modelResponse = action;
        }

        await memory.saveContext(
          {
            input: prompt,
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
    }
  } catch (error) {
    // Log the error or handle it as needed
    console.error("An error occurred during the query operation:", error);
    // You could return a default error message or rethrow the error depending on your error handling strategy
    throw error; // or return a default message like "An error occurred. Please try again."
  }
}

export default query;

