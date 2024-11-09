import { ChatOpenAI } from '@langchain/openai';
//import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { BufferMemory } from 'langchain/memory';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
//import { AIMessage, HumanMessage } from 'langchain/schema';
import fs from 'fs/promises';

const currentChatId: string = '';

const chatModel = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
});

const memory = new BufferMemory({
    returnMessages: true,
    inputKey: 'input',
    outputKey: 'output',
    memoryKey: 'history',
});

const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', `The user will present an opinion. Your job is challenge this opinion with follow-up questions.`],
    new MessagesPlaceholder('history'),
    ['human', `{input}`],
]);


const chain = RunnableSequence.from([
    {
        input: (initialInput) => initialInput.input,
        speaker: (initialInput) => initialInput.speaker,
        memory: async () => await memory.loadMemoryVariables({}), // ATTENTION: shoud we await this?
    },
    {
        input: (previousOutput) => previousOutput.input,
        speaker: (previousOutput) => previousOutput.speaker,
        history: (previousOutput) => previousOutput.memory.history,
    },
    promptTemplate,
    async (previousOutput) => {
        try {
            const data = JSON.stringify(previousOutput, null, 2); // Beautify the JSON
            await fs.writeFile('C:\\Users\\renes\\Documents\\output.json', data, 'utf-8');
            //console.log('previousOutput:', previousOutput);
        } catch (error) {
            console.error('Failed to write previousOutput to file:', error);
        }
        return previousOutput;
    },
    chatModel,
]);


const invokeChainWrapper = async ({ chatId, promptSeed, userName }: { chatId: string; promptSeed: string; userName: string }) => {

    try {
        // Check if a new chat has started or the existing one continues // ATTENTION: there'll never be a new chat
        if (currentChatId !== chatId) {
            /* console.log('Are we here?')
            
            const messagesSnapshot = await dbAdmin // ATTENTION_
              .collection('chats')
              .doc(chatId)
              .collection('messages')
              .orderBy('timestamp', 'asc')
              .get();
      
            const pastMessages = messagesSnapshot.docs.map(doc => {
              const data = doc.data();
              return data.userId === 'ChatGPT' ?
                new AIMessage(data.content) :
                new HumanMessage(data.content);
            });
      
            const chatHistory = new ChatMessageHistory(pastMessages);
            
            memory = new BufferMemory({
                returnMessages: true,
                inputKey: 'input',
                outputKey: 'output',
                memoryKey: 'history',
                //chatHistory: chatHistory,
            });

            currentChatId = chatId; */
        }

        const inputs = {
            input: promptSeed,
            speaker: userName,
        };

        const response = await chain.invoke(inputs);
        // console.log('chatModel', chatModel);

        if (response && response.lc_kwargs) { // ATTENTION: optional chaining

            // console.log('response', JSON.stringify(response, null, 2));

            const responseContent = response.lc_kwargs.content;

            return responseContent;
        } else {
            // Handle the case when response is not as expected
            throw new Error('Received an unexpected response format from the chain invocation.');
        }
    } catch (error) {
        throw new Error(`An operation failed: ${(error as Error).message}`);
    }
}

export default invokeChainWrapper;