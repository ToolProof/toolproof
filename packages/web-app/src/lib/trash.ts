/* 


const promptTemplateBeta = ChatPromptTemplate.fromMessages([
    ["system", `You are a moderator between two humans who are discussing. 
    The current speaker is {speaker}. 
    Summarize what {speaker} says, decide who the next speaker is, and prompt the next speaker for their opinion. 
    In this conversation, the speakers are René and Peter.`],
  
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);
  


const functionSchemaBeta = [
    {
      name: "moderation",
      description: "An instance of moderation",
      parameters: {
        type: "object",
        properties: {
          moderatorSummaryAndPrompt: {
            type: "string",
            description: "The content of the moderation",
          },
          nextSpeaker: {
            type: "string",
            description: "The next speaker in the conversation",
          },
        },
        required: ["moderatorSummaryAndPrompt", "nextSpeaker"],
      },
    },
  ];

  const chainBeta = RunnableSequence.from([
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
    promptTemplateBeta,
    chatModel.bind({
      functions: functionSchemaBeta,
      function_call: { name: "moderation" },
    }),
  ]);

  const response = await chainBeta.invoke(inputs);

      // It's important to check if the response is successful before attempting to save the context
      if (response && response.additional_kwargs && response.additional_kwargs.function_call) {

        const argsString = response.additional_kwargs.function_call.arguments;
        const args = JSON.parse(argsString);
        const moderatorSummaryAndPrompt = args.moderatorSummaryAndPrompt;

        await memory.saveContext(
          {
            input: prompt,
          }, { //ATTENTION
          output: moderatorSummaryAndPrompt,
        });

        return args; 
      } else {
        // Handle the case when response is not as expected
        throw new Error("Received an unexpected response format from the chain invocation.");
      }
*/