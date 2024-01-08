"use client"
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/solid";
import sendPrompt from "../../lib/sendPrompt";
import * as Constants from "../../setup/definitions/constants";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAddMessageMutation } from "@/redux/features/rtkQuerySlice";
import { useAppSelector } from "@/redux/hooks";
import { useAddConversationMutation } from "@/redux/features/rtkQuerySlice";
import addConversationWrapper from "@/lib/addConversationWrapper";

type Props = {
    conversationId: string;
};

export default function ConversationInput({ conversationId }: Props) {
    const [input, setInput] = useState("");
    const conversation = useAppSelector((state) => state.conversations.conversations.find((c) => c.id === conversationId));
    const turnState = conversation?.turnState;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { data: session } = useSession();
    const router = useRouter();
    const toastIdRef = useRef<string | undefined>(undefined);
    const [addMessage] = useAddMessageMutation();
    const [addConversation] = useAddConversationMutation();
    const userEmail = session?.user?.email;

    async function addMessageWrapper(content: string) {
        try {
            await addMessage({ conversationId, message: { userId: "René", content: content } }); //ATTENTION_
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while sending the message.");
            // Optionally revert optimistic UI updates here
        }
    }

    const submissionHelper = async () => {
        const content = input.trim();
        setInput("");
        await addMessageWrapper(content);
        const data = await sendPrompt(conversationId, content);
        // Check if the sendPrompt property exists and is not null
        if (data && data.sendPrompt) {
            console.log("action", data.sendPrompt.action);
            if (data.sendPrompt.action === Constants.create_new_conversation) {
                if (session) {
                    // Create a new conversation
                    try {
                        if (userEmail) {
                            const newConversation = addConversationWrapper(userEmail, conversationId);
                            const result = await addConversation(newConversation).unwrap();
                            if (result && result.conversationId) {
                                router.push(`/conversation/${result.conversationId}`);
                            } else {
                                console.error("Conversation creation did not return a valid ID");
                            }
                        }
                    } catch (err) {
                        console.error("Failed to create conversation", err);
                    }
                }
            } else if (data.sendPrompt.action === Constants.back_to_parent) {
                const parentId = conversation?.parentId; //ATTENTION: what if parentId is "base"?
                router.push(`/conversation/${parentId}`);
            }
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submissionHelper();
    };

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
                renderHelper(turnState === -1)
            }
        </div>
    );
}
