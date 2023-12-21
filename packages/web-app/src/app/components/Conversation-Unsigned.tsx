"use client"
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../setup/firebaseClient";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { Message } from "../../setup/definitions/typings";
import MessageDisplay from "./MessageDisplay-Beta";
import { useEffect } from "react";

type Props = {
    conversationId: string;
}

function Conversation({conversationId}: Props) {
    const [ messages ] = useCollection(query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc"),
    ))

    useEffect(() => {
        const updateConversationStatus = async () => {
            if (conversationId) {
                const conversationRef = doc(db, "conversations", conversationId);
                await updateDoc(conversationRef, {
                    turnState: 1 //ATTENTION: what if the conversation is already in progress?
                });
            }
        };
        updateConversationStatus();
    }, [conversationId]);

    const isNewMessage = (messageTimestamp: FirebaseFirestore.Timestamp) => {
        // Convert Firestore Timestamp to JavaScript Date object
        const messageDate = messageTimestamp.toDate();
        const now = new Date();

        // Calculate the difference in seconds
        const timeDifference = (now.getTime() - messageDate.getTime()) / 1000;
        return timeDifference < 60; // considering messages within the last 60 seconds as new
    };
    
    return (
        <div className="baseBackground flex-1 overflow-y-auto overflow-x-hidden">
            {messages?.empty && (
            <div>
                <p className="mt-10 text-center text-black">
                    Type a prompt to start a conversation!
                </p>
                <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-black animate-bounce"/>
            </div>
        )}
            {messages?.docs.map((messageDoc) => {
                const message = messageDoc.data() as Message;
                const isNew = isNewMessage(message.timestamp);
                return <MessageDisplay key={messageDoc.id} message={message} isNew={isNew} />
            })}
        </div>
    );
}

export default Conversation;