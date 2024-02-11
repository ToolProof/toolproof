/* 


const promptTemplateBeta = ChatPromptTemplate.fromMessages([
    ["system", `You are a moderator between two humans who are discussing. 
    The current speaker is {speaker}. 
    Summarize what {speaker} says, decide who the next speaker is, and prompt the next speaker for their opinion. 
    In this chat, the speakers are René and Peter.`],
  
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
            description: "The next speaker in the chat",
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



/* function BetaMode({ session }: ModeProps) {
  const [input, setInput] = useState("");

  const sendInvitation = async (email: string, invitationLink: string) => {
    try {
      const response = await fetch("/api/sendInvitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, invitationLink }),
      });

      if (response.ok) {
        console.log("Server response:");
      } else {
        console.error("Failed to send invitation");
      }
    } catch (error: unknown) {
      // Check if error is an instance of Error
      if (error instanceof Error) {
        console.error("Error sending invitation:", error.message);
      } else {
        console.error("Error sending invitation: An unknown error occurred");
      }
    }
  };

  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chatId = await createChatInFirestore(session, "base", 2);
    if (chatId) {
      const invitationLink = `https://www.toolproof.com/chat/invitee/${chatId}`;
      await sendInvitation(input, invitationLink);
      setInput("");
    } 
  }

  return (
    <form onSubmit={handleClick}>
      <input
        type="email"
        placeholder="Enter invitee's email"
        className="p-2 rounded-l-md border border-gray-300 w-96 mr-4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md" type="submit">
        Send
      </button>
    </form>
  );
} */


/* function BetaMode({ turnState, renderHelper: renderHelper }: ModeProps) {
  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
      if (turnState > 1 || turnState < 0) {
          if (turnState === -1) {
              toastIdRef.current = toast.loading("ChatGPT is thinking...");
          } else if (turnState === -2) {
              toastIdRef.current = toast.loading("ChatGPT is thinking...");
          } else if (turnState === 2) {
              toastIdRef.current = toast.loading("Waiting for your partner to respond...");
          }
      } else if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
      }

      return () => {
          if (toastIdRef.current) {
              toast.dismiss(toastIdRef.current);
          }
      };
  }, [turnState]);

  return (
      <>
          {renderHelper(turnState > 1 || turnState < 0)}
      </>
  );
} */


/* useEffect(() => {
  const checkAndHandleChat = async () => {
    if (userEmail && await userChatsIsEmpty(userEmail)) {
      try {
        const result = await addChat({ parentId: Constants.meta, userId: userEmail, turnState: 0 });
        if (result && result.data && result.data.chatId) {
          router.push(`/chat/${result.data.chatId}`);
        } else {
          console.error("Chat creation did not return a valid ID");
        }
      } catch (err) {
        console.error("Failed to create chat", err);
      }
    };
  }
  checkAndHandleChat();
}, [userEmail, router]);


useEffect(() => {
  if (!loading && chats.length > 0) {
    // Redirect to the first chat
    const existingChatId = chats[0].id;
    router.push(`/chat/${existingChatId}`);
  }
}, [loading, chats, router]); 


export async function userChatsIsEmpty(userId: string) {
    const q = query(
        collection(db, Constants.chats),
        where(Constants.userId, "==", userId),
        orderBy(Constants.timestamp, Constants.asc),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

*/






