"use client"
import { useState, useEffect, useRef } from "react";
// import { toast } from "react-hot-toast";
import sendPromptAction from "@/lib/sendPromptAction";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
// import * as Constants from "shared/constants";
import { ConversationRead } from "shared/typings";
import { addMessage } from "@/lib/firestoreHelpersClient";


type Props = {
    conversation: ConversationRead;
};


export default function ConversationInput({ conversation }: Props) {
    const [input, setInput] = useState("");
    const turnState = conversation?.turnState;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    //const { data: session } = useSession();
    //const router = useRouter();
    // const toastIdRef = useRef<string | undefined>(undefined);
    //const userEmail = session?.user?.email;
    const isTyping = useAppSelector(state => state.typewriter.isTyping);


    const addMessageWrapper = async (content: string) => {
        try {
            await addMessage(conversation.path, { userId: "René", content: content }); //ATTENTION hardcoded user
        } catch (error) {
            console.error("Error:", error);
            // Optionally revert optimistic UI updates here
        }
    }


    const submissionHelper = async () => {
        const content = input.trim();
        setInput("");
        await addMessageWrapper(content);
        // const data = 
        await sendPromptAction({ path: conversation.path, prompt: content, user: "René" }); //ATTENTION[hardcoded user, message order not secured]
        /* if (data && data.action) {
            console.log("action", data.action);
            if (data.action === Constants.create_new_conversation) {
                if (session) {
                    // Create a new conversation
                    try {
                        if (userEmail) {
                            const result = await addChild({conversationId, { userId: userEmail, type: Constants.data, turnState: 0 }});
                            if (result && result.data && result.data.conversationId) {
                                router.push(`/conversation/${result.data.conversationId}`);
                            } else {
                                console.error("Conversation creation did not return a valid ID");
                            }
                        }
                    } catch (err) {
                        console.error("Failed to create conversation", err);
                    }
                }
            } else if (data.action === Constants.back_to_parent) {
                const parentId = conversation?.parentId; //ATTENTION: what if parentId is "meta"?
                router.push(`/conversation/${parentId}`);
            }
        } */
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
            // toastIdRef.current = toast.loading("ChatGPT is thinking...");
        } else {
            /* if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            } */
            textareaRef.current?.focus();
        }
        /* return () => {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        }; */
    }, [turnState]);


    const renderHelper = (criterion: boolean) => {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col justify-center relative mx-48 mb-4 p-2 rounded-2xl border-2 border-gray-500 text-black">
                <textarea
                    ref={textareaRef}
                    className="p-4 pr-16 max-h-[10em] focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-300"
                    disabled={criterion}
                    placeholder="Type your message here..."
                    value={input}
                    rows={1}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={`absolute right-10 bottom-4 h-8 w-8 rounded-lg
                    ${!input ? "disabled:cursor-not-allowed" : "hover:opacity-50"}
                   `}
                    disabled={!input}
                    type="submit"
                >
                    {
                        (criterion || isTyping) ?
                            <div className="flex justify-center items-center w-8 h-8 bg-transparent">
                                <img src="/icons/encircled_square.png" />
                            </div>
                            :
                            <div
                                className={`flex justify-center items-center h-8 w-8 bg-black
                                ${!input && "bg-gray-300"}
                                `}
                            >
                                <div className="w-4 h-4"> {/*ATTENTION: without the outer div, img might violate restrictions*/}
                                    <img className="w-4 h-4"
                                        src="/icons/up_arrow.png"/>
                                </div>
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
