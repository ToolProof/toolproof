"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import MessageDisplay from "./MessageDisplay";
import { useAppSelector } from "@/redux/hooks";

type Props = {
    conversationId: string;
}

function Conversation({ conversationId }: Props) {
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const messages = useAppSelector((state) => state.conversations.conversations.find((c) => c.id === conversationId)?.messages);
    const [componentMountTime, setComponentMountTime] = useState(new Date());

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

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
        const timeBetweenMessageCreationAndComponentMount = (componentMountTime.getTime() - messageCreationTime.getTime()) / 1000;

        return timeBetweenMessageCreationAndComponentMount < 0 && timeSinceMessageCreation < 30;
    };

    return (
        <div className="bg-white flex-1 overflow-y-auto overflow-x-hidden">
            {messages && messages.length === 0 && (
                <div>
                    <p className="mt-10 text-center text-black">
                        Type a prompt to start a conversation!
                    </p>
                    <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-black animate-bounce" />
                </div>
            )}
            {messages?.map((message, index) => {
                const isNew = isNewMessage(message.timestamp as FirebaseFirestore.Timestamp, index, messages.length);

                const messageComponent = <MessageDisplay key={message.id} message={message} isNew={isNew} />

                if (index === messages.length - 1) {
                    return <div ref={lastMessageRef} key={message.id}>{messageComponent}</div>;
                } else {
                    return messageComponent;
                }
            })}
        </div>
    );

}

export default Conversation;