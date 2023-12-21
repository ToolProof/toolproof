"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../setup/firebaseClient";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { Message } from "shared/typings";
import { useAlfa } from "./AlfaProvider";
import MessageDisplayAlfa from "./MessageDisplay-Alfa";
import MessageDisplayBeta from "./MessageDisplay-Beta";


type Props = {
    conversationId: string;
}

function Conversation({ conversationId }: Props) {
    const { data: session } = useSession();
    const { isAlfa } = useAlfa();
    const [messages] = useCollection(session && (
        query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("timestamp", "asc"),
        )
    ));
    const [componentMountTime, setComponentMountTime] = useState(new Date());

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
        <div className="baseBackground flex-1 overflow-y-auto overflow-x-hidden">
            {messages?.empty && (
                <div>
                    <p className="mt-10 text-center text-black">
                        Type a prompt to start a conversation!
                    </p>
                    <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-black animate-bounce" />
                </div>
            )}
            {messages?.docs.map((messageDoc, index) => {
                const data = messageDoc.data();
                const isNew = isNewMessage(data.timestamp, index, messages.docs.length);
                const message = data as Message;
                
                return isAlfa ? (
                    <MessageDisplayAlfa key={messageDoc.id} message={message} isNew={isNew} />
                ) : (
                    <MessageDisplayBeta key={messageDoc.id} message={message} isNew={isNew} />
                );
            })}
        </div>
    );
}

export default Conversation;