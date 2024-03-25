"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import MessageDisplay from "./MessageDisplay";
import { ChatRead } from "shared/src/typings";
import { useMessages } from "@/lib/firestoreHelpersClient";

type Props = {
    chat: ChatRead;
}


export default function ChatDisplay({ chat }: Props) {
    const [componentMountTime, setComponentMountTime] = useState(new Date());
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const { messages } = useMessages(chat.id);
    
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                setComponentMountTime(new Date());
            }
        };

        // Add event listener
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []); // Empty dependency array ensures this runs only once on mount
    

    function isNewMessage(messageTimestamp: FirebaseFirestore.Timestamp | null, index: number, arrayLength: number) {

        // Check if it's the last message
        if (index !== arrayLength - 1) {
            return false;
        }

        if (!messageTimestamp || typeof messageTimestamp.toDate !== "function") {
            // Handle the case where timestamp is null or not a Firestore Timestamp
            return false;
        }

        const messageCreationTime = messageTimestamp.toDate();
        const currentTime = new Date();
        const timeSinceMessageCreation = (currentTime.getTime() - messageCreationTime.getTime()) / 1000;
        const timeBetweenMessageCreationAndComponentMount = (messageCreationTime.getTime() - componentMountTime.getTime()) / 1000;

        return timeBetweenMessageCreationAndComponentMount > 0 && timeSinceMessageCreation < 30;
    };


    useEffect(() => {
        const scrollToBottom = () => {
            const messageContainer = messageContainerRef.current;
            if (messageContainer) {
                messageContainer.scrollTo({
                    top: messageContainer.scrollHeight,
                    behavior: "smooth"
                });
            }
        };

        setTimeout(scrollToBottom, 1000);

    }, [chat.id]);


    const handleTextChange = () => {
        const messageContainer = messageContainerRef.current;
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth"
            });
        }
    };


    return (
        <div ref={messageContainerRef} className="max-h-[calc(80vh)] overflow-y-auto overflow-x-hidden bg-[#ffffff]">
            {messages && messages.length === 0 && (
                <div>
                    <p className="mt-10 text-center text-black">
                        Type a prompt to start a chat!
                    </p>
                    <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-black animate-bounce" />
                </div>
            )}
            {messages?.map((message, index) => {
                const isNew = isNewMessage(message.timestamp, index, messages.length);
                //console.log("message", message.tags[0]);
                const messageComponent = <MessageDisplay
                    key={message.id}
                    message={message}
                    isNew={isNew}
                    onTextChange={handleTextChange}
                />
                return messageComponent;
            })}
    
        </div>
    );

}