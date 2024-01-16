"use client"
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/solid";
import sendPromptAction from "../../lib/sendPromptAction";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAddMessageMutation } from "@/redux/features/rtkQuerySlice";
import { useAppSelector } from "@/redux/hooks";
import { useAddConversationMutation } from "@/redux/features/rtkQuerySlice";
import * as Constants from "../../setup/definitions/constants";


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


    const addMessageWrapper = async (content: string) => {
        try {
            await addMessage({ conversationId: conversationId, message: { userId: "René", content: content } }); //ATTENTION hardcoded user
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
        const data = await sendPromptAction({ conversationId: conversationId, prompt: content, user: "René" }); //ATTENTION[hardcoded user, message order not secured]

        if (data && data.action) {
            console.log("action", data.action);
            if (data.action === Constants.create_new_conversation) {
                if (session) {
                    // Create a new conversation
                    try {
                        if (userEmail) {
                            const result = await addConversation({ parentId: conversationId, userId: userEmail, turnState: 0 }).unwrap();
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
            } else if (data.action === Constants.back_to_parent) {
                const parentId = conversation?.parentId; //ATTENTION: what if parentId is "base"?
                router.push(`/conversation/${parentId}`);
            }
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent default to stop new line in textarea
            submissionHelper();
        }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submissionHelper();
    };


    const updateInputHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // Reset height to auto to get the new scroll height
            const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10); // Get the max height from computed styles
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`; // Set the height up to the max height
        }
    };


    useEffect(() => {
        updateInputHeight();
    }, [input]);


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
            <form onSubmit={handleSubmit} className="flex flex-col justify-center relative mx-48 mb-4 p-2 rounded-2xl border-2 border-gray-500 text-black">
                <textarea
                    ref={textareaRef}
                    className="p-4 pr-16 max-h-[10em] focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-300 bg-transparent w-full overflow-auto resize-none"
                    disabled={criterion}
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="absolute right-10 bottom-4 h-8 w-8 font-bold disabled:cursor-not-allowed bg-[#11A37F] disabled:bg-gray-300 text-white hover:opacity-50 px-4 py-2 rounded"
                    disabled={!input}
                    type="submit"
                >
                    {
                        criterion ?
                            <div className="flex justify-center items-center">
                                <StopIcon className="bg-white text-black" />
                            </div>
                            :
                            <div className="flex justify-center items-center">
                                <ArrowUpIcon className="h-6 w-6" />
                            </div>
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
