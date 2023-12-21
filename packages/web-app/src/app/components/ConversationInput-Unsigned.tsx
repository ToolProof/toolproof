"use client"
import { toast} from "react-hot-toast"
import { useState, useEffect, useRef, FormEvent } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { useSession } from "next-auth/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../setup/firebaseClient";
import { doc } from "firebase/firestore";
import { Message } from "shared/typings";
import { MutationSendPromptArgs, PromptResponse } from "../../setup/generated/typesClient";
import { gql } from "@apollo/client";
import { client } from "../../setup/apolloClient";

type Props = {
    conversationId: string;
}

function ConversationInput({conversationId}: Props) {
    const [input, setInput] = useState("");
    const {data: session} = useSession();
    const conversationRef = doc(db, "conversations", conversationId);
    const [conversationSnapshot] = useDocument(conversationRef);
    const toastIdRef = useRef<string | undefined>(undefined);
    const turnState = conversationSnapshot?.data()?.turnState;

    useEffect(() => {
        if (turnState !== 2) {
            if (turnState === -2) {
                toastIdRef.current = toast.loading("ChatGPT is thinking...");
            }  else if (turnState === -1) {
                toastIdRef.current = toast.loading("ChatGPT is thinking...");
            } else if (turnState === 1) {
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

    const sendMessageAndPrompt = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input) return;
        const content = input.trim();
        setInput("");
    
        const variables: MutationSendPromptArgs = {
            conversationId,
            prompt: content,
            user: session?.user?.name || "Peter",
            isAlfa: false,
        };

        const SEND_PROMPT_MUTATION = gql`
          mutation SendPrompt($conversationId: String!, $prompt: String!, $user: String!, $isAlfa: Boolean!) {
            sendPrompt(conversationId: $conversationId, prompt: $prompt, user: $user, isAlfa: $isAlfa) {
              action
            }
          }
        `;

        try {
            // Adding the message to Firestore
            const message: Message = {
                timestamp: serverTimestamp(),
                userId: session?.user?.name || "Peter",
                content,
            };
            await addDoc(collection(db, "conversations", conversationId, "messages"), message);

            // Execute the GraphQL mutation
            const { data } = await client.mutate<PromptResponse>({
                mutation: SEND_PROMPT_MUTATION,
                variables,
            });
            console.log(data?.action);
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while sending the message.");
            // Optionally revert optimistic UI updates here
        }
    };
    
    return (
        <div className="bg-gray-700/50 text-gray-400 rounded-lg text-sm">
            <form onSubmit={sendMessageAndPrompt} className="p-5 space-x-5 flex">
                <input
                    className="bg-transparent focus:outline-none flex-1 disabled:cursor-not-allowed disabled:text-gray-300"
                    disabled={turnState !== 2}
                    type="text"
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    className="bg-[#11A37F] hover:opacity-50 text-white font-bold px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!input}
                    type="submit"
                >
                    <PaperAirplaneIcon className="h-4 w-4 rotate-45"/>
                </button>
                
            </form>
        </div>
    );
}

export default ConversationInput;