"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import MessageDisplay from "./MessageDisplay";
import { useMessagesForConversation } from "@/redux/hooks";
/* import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "shared/firebaseClient";
import { MessageRead } from "shared/typings"; */


type Props = {
    conversationId: string;
}


export default function Conversation({ conversationId }: Props) {
    const messages = useMessagesForConversation(conversationId);
    /* const messagesQuery = conversationId
        ? query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"), limit(100))
        : null;
    const [messageSnapshots] = useCollection(messagesQuery);
    const messages = messageSnapshots?.docs.map((doc) => doc.data() as MessageRead) ?? []; */
    const [componentMountTime, setComponentMountTime] = useState(new Date());
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    
    
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
        // Function to scroll to the bottom of the container
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

    }, [conversationId]);


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
        <div ref={messageContainerRef} className="max-h-[calc(80vh)] overflow-y-auto overflow-x-hidden">
            {messages && messages.length === 0 && (
                <div>
                    <p className="mt-10 text-center text-black">
                        Type a prompt to start a conversation!
                    </p>
                    <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-black animate-bounce" />
                </div>
            )}
            {messages?.map((message, index) => {
                const isNew = isNewMessage(message.timestamp, index, messages.length);

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