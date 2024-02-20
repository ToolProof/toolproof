"use client"
import * as Constants from "shared/src/flow_0/constants"
import { useState, useEffect, useRef } from "react";
// import { toast } from "react-hot-toast";
import sendPromptAction from "@/flow_1/lib/sendPromptAction";
import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { useAppSelector } from "@/flow_1/lib/redux/hooks";
// import * as Constants from "shared/src/flow_0/constants";
import { ChatRead } from "shared/src/flow_0/typings";
import { addMessage } from "@/flow_1/lib/firestoreHelpersClient";


type Props = {
    chat: ChatRead;
};


export default function ChatInput({ chat }: Props) {
    const [input, setInput] = useState("");
    const turnState = chat?.turnState;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { data: session } = useSession();
    //const router = useRouter();
    // const toastIdRef = useRef<string | undefined>(undefined);
    const userEmail = session?.user?.email || "";
    const userName = session?.user?.name || "";
    const isTyping = useAppSelector(state => state.typewriter.isTyping);


    const addMessageWrapper = async (content: string) => {
        try {
            const userMessage = await addMessage(chat.id, { userId: userEmail, content: content, tags: [Constants.TEST] });
            return userMessage;
        } catch (error) {
            console.error("Error:", error);
            throw new Error("An error occurred while adding message");
            // Optionally revert optimistic UI updates here
        }
    }


    const submissionHelper = async () => {
        const content = input.trim();
        setInput("");
        const userMessage = await addMessageWrapper(content);
     
        const data = await sendPromptAction({ chatId: chat.id, promptSeed: content, userName, userMessage }); //ATTENTION: message order not secured
        if (data && data.topicDetected && data.action) {
            /*
                * Could interact with the Redux store here
            */
            console.log("topicDetected", data.topicDetected);
            console.log("action", data.action);
        } else {
            console.log("No topic detected or action found");
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
            // Reset height to auto to get the new scroll height
            textarea.style.height = "auto";
            const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10);
            // Calculate new height based on content, up to the max height
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;

            // Adjust the bottom position to move up as the textarea grows
            // This requires the textarea (or its container) to have `position: absolute;` 
            // and be inside a `position: relative;` container.
            const offset = maxHeight - newHeight;
            textarea.style.bottom = `${offset}px`;
        }
    };


    useEffect(() => { //ATTENTION: should we use LayoutEffect?
        updateInputHeight();
    }, [input]);


    useEffect(() => { //ATTENTION: should we use LayoutEffect?
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
            <form onSubmit={handleSubmit} className="flex items-center relative h-full bg-[#ffffff]">
                <textarea
                    ref={textareaRef}
                    className={`w-full min-h-[4em] max-h-[20em] mx-72 mt-12 mb-4 pl-3 pr-20 pt-6 pb-1 rounded-2xl outline-none bg-[#f0eded]
                    disabled:cursor-not-allowed placeholder:text-gray-300
                    `}
                    disabled={criterion}
                    placeholder="Type your message here..."
                    value={input}
                    rows={1}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                
                <button
                    className={`absolute right-[19.5rem] bottom-6 flex justify-center items-center h-10 w-10 rounded-xl
                    ${!input ? "disabled:cursor-not-allowed" : "hover:opacity-50"}
                    ${!input ? "bg-gray-300" : "bg-black"}
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
                                <div className="w-4 h-4"> 
                                    <img className="w-4 h-4"
                                        src="/icons/up_arrow.png"/>
                                </div>
                            </div>
        }
                </button>
                
            </form>
        )
    }


    return renderHelper(turnState === -1);

}