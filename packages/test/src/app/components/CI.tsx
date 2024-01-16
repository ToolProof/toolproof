"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { StopIcon } from "@heroicons/react/24/solid";
import { db } from "shared/firebaseClient";
import { doc, collection, serverTimestamp, writeBatch} from "firebase/firestore";
import sendPrompt from "../sendPromptAction";
import { useDocument } from "react-firebase-hooks/firestore";


type Props = {
    conversationId: string;
}

export default function ConversationInput({ conversationId }: Props) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [conversationSnapshot] = useDocument(doc(db, "conversations", conversationId));
    const conversation = conversationSnapshot?.data();
    const turnState = conversation?.turnState;
    const turnStateRef = useRef(turnState);

    const addMessageHelper = async (content: string) => {
        const batch = writeBatch(db);
        const messageRef = doc(collection(db, "conversations", conversationId, "messages"));
        batch.set(messageRef, { userId: "René", content: content, timestamp: serverTimestamp() });
        const conversationRef = doc(db, "conversations", conversationId);
        batch.update(conversationRef, { turnState: -1 });
        await batch.commit();
    }

    const submissionHelper = async () => {
        const prompt = input.trim();
        setInput("");
        await addMessageHelper(prompt);
    
        const intervalId = setInterval(async () => {
            if (turnStateRef.current === -1) {
                clearInterval(intervalId);
                await sendPrompt({ conversationId, prompt, user: "René" }); //ATTENTION: secures the order of messages
            }
        }, 100); // Check every 100ms
    };
    
    useEffect(() => {
        turnStateRef.current = turnState;
        /* if (turnState === 1) {
            textareaRef.current?.focus();
        } else if (turnState === -1) {
            textareaRef.current?.blur();
        } */
    }, [turnState]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submissionHelper();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent default to stop new line in textarea
            submissionHelper();
        }
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col justify-center relative mx-48 mb-4 p-2 rounded-2xl border-2 border-gray-500 text-black">
            <textarea
                ref={textareaRef}
                className="p-4 pr-16 max-h-[10em] focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-300"
                disabled={turnState === -1}
                placeholder="Type your message here..."
                value={input}
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                type="submit"
                disabled={!input}
                className="absolute right-10 bottom-4 h-8 w-8 font-bold disabled:cursor-not-allowed hover:opacity-50 bg-[#11A37F] disabled:bg-gray-300 text-white"
            >
                {
                    turnState === -1 ?
                        <div className="flex justify-center items-center">
                            <StopIcon className="bg-white text-black"/>
                        </div>
                        :
                        <div className="flex justify-center items-center">
                            <ArrowUpIcon className="h-6 w-6" />
                        </div>
                }
            </button>

        </form>
    );
}