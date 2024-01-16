"use client";
import { useState, useEffect, useRef, use } from "react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "shared/firebaseClient";
import { MessageRead } from "shared/typings";
import MessageDisplay from "./MD";

type Props = {
    conversationId: string;
}

export default function Conversation({ conversationId }: Props) {
    const messagesQuery = conversationId
        ? query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"), limit(100))
        : null;
    const [messageSnapshots, loading, error] = useCollection(messagesQuery);
    const messages = messageSnapshots?.docs.map((doc) => doc.data() as MessageRead) ?? [];
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


    const isNewMessage = (messageTimestamp: FirebaseFirestore.Timestamp | null, index: number, arrayLength: number) => {

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
                    behavior: 'smooth'
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
                behavior: 'smooth'
            });
        }
    };


    if (error) {
        return <p>Error loading messages: {error.message}</p>;
    }


    return (
        <div ref={messageContainerRef} className="max-h-[calc(80vh)] overflow-y-auto overflow-x-hidden">
            {loading && <div className="flex justify-center items-center">
                <p>Loading...</p>
            </div>}
            {!loading && messages.length === 0 && <div className="flex justify-center items-center">
                <p>No messages</p>
            </div>}
            {messages.map((message, index) => {
                const isNew = isNewMessage(message.timestamp, index, messages.length);
                return <MessageDisplay key={index} message={message} isNew={isNew} onTextChange={handleTextChange} />
            }
            )}
        </div>
    );
}
