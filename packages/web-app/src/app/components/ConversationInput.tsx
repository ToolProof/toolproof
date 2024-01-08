"use client"
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useDocument } from "react-firebase-hooks/firestore";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/solid";
import { doc, } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import { MutationSendPromptArgs, Mutation } from "../../setup/generated/typesClient";
import { gql } from "@apollo/client";
import { client } from "../../setup/apolloClient";
import { createConversationInFirestore } from "../../lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as Constants from "../../setup/definitions/constants"
import { useAddMessageMutation } from "@/redux/features/rtkQuerySlice";

type Props = {
    conversationId: string;
};

export default function ConversationInput({ conversationId }: Props) {
    const isAlfa = true;
    const [input, setInput] = useState("");
    const conversationRef = doc(db, "conversations", conversationId);
    const [conversationSnapshot] = useDocument(conversationRef);
    const turnState = conversationSnapshot?.data()?.turnState;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const [ addMessage ] = useAddMessageMutation();


    async function sendMessage(content: string) {
        try {
            await addMessage({conversationId, message: {userId: "René", content: content}}); //ATTENTION_
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while sending the message.");
            // Optionally revert optimistic UI updates here
        }
    }

    async function sendPrompt(content: string) {

        const variables: MutationSendPromptArgs = {
            conversationId,
            prompt: content,
            user: "René",
            isAlfa: isAlfa,
        };

        // Define your GraphQL mutation
        const SEND_PROMPT_MUTATION = gql`
          mutation SendPrompt($conversationId: String!, $prompt: String!, $user: String!, $isAlfa: Boolean!) {
            sendPrompt(conversationId: $conversationId, prompt: $prompt, user: $user, isAlfa: $isAlfa) {
              action
            }
          }
        `;

        try {
            // Execute the mutation
            const response = await client.mutate<Mutation>({
                mutation: SEND_PROMPT_MUTATION,
                variables,
            });
            // Check if the data property exists and is not null
            if (response.data) {
                const data: Mutation = response.data;
                // Check if the sendPrompt property exists and is not null
                if (data.sendPrompt) {
                    console.log("action", data.sendPrompt.action);
                    if (data.sendPrompt.action === Constants.create_new_conversation) {
                        if (session) {
                            const newConversationId = await createConversationInFirestore(session, conversationId, 1);
                            if (newConversationId) {
                                router.push(`/conversation/${newConversationId}`);
                            }
                        }
                    } else if (data.sendPrompt.action === Constants.back_to_parent) {
                        const parentId = conversationSnapshot?.data()?.parentId; //ATTENTION: what if parentId is "base"?
                        router.push(`/conversation/${parentId}`);
                    }
                }
            } else {
                // Handle the case where data is null or undefined
                console.log("No data returned from server.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred during the request.");
        }
    }

    const updateInputHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10);

            // Set the textarea height, not exceeding the maxHeight
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
        }
    };

    useEffect(() => {
        updateInputHeight();
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent default to stop new line in textarea
            submissionHelper();
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submissionHelper();
    }


    const submissionHelper = async () => {
        const content = input.trim();
        setInput("");
        await sendMessage(content);
        await sendPrompt(content);
    }


    const renderHelper = (criterion: boolean) => {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col justify-center relative rounded-lg bg-white text-black text-sm mx-4 mb-4 p-5 border-2 border-gray-300">
                <textarea
                    ref={textareaRef}
                    className="bg-transparent focus:outline-none w-full disabled:cursor-not-allowed placeholder:text-gray-300 max-h-[10em] overflow-auto resize-none pr-20"
                    disabled={criterion}
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="absolute right-12 bottom-6 bg-[#11A37F] hover:opacity-50 text-white font-bold px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!input}
                    type="submit"
                >
                    {
                        criterion ?
                            <StopIcon className="h-4 w-4" />
                            :
                            <ArrowUpIcon className="h-4 w-4" />
                    }

                </button>
            </form>
        )
    }

    return (
        <div>
            {
                isAlfa ? (
                    <AlfaMode
                        turnState={turnState}
                        textareaRef={textareaRef}
                        renderHelper={renderHelper}
                    />
                )
                    : (
                        <BetaMode
                            turnState={turnState}
                            textareaRef={textareaRef}
                            renderHelper={renderHelper}
                        />
                    )
            }
        </div>
    );
}


type ModeProps = {
    turnState: number;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    renderHelper: (criterion: boolean) => JSX.Element;
};


function AlfaMode({ turnState, textareaRef, renderHelper }: ModeProps) {
    const toastIdRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (turnState === -1) {
            toastIdRef.current = toast.loading("ChatGPT is thinking...");
        } else {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
            textareaRef.current?.focus();
        }
        return () => {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        };
    }, [turnState, textareaRef]); //ATTENTION: textareaRef should maybe be an effect-dependency

    return (
        <>
            {renderHelper(turnState === -1)}
        </>
    );
}


function BetaMode({ turnState, renderHelper: renderHelper }: ModeProps) {
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
}
