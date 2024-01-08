"use client"
import { useSession, signOut } from "next-auth/react"
import { query, collection, onSnapshot, where, orderBy, Unsubscribe } from "firebase/firestore";
import { db } from "shared/firebaseClient";
import ConversationRow from "./ConversationRow";
import { useEffect } from "react";
import { updateConversations, updateMessages, setIsFetched } from "@/redux/features/mainSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { Conversation, Message } from "shared/typings";

function SideBar() {
    const { data: session } = useSession();
    const dispatch = useAppDispatch();
    const conversations = useAppSelector((state) => state.conversations.conversations); //ATTENTION: could we load only the ids here?
    const isFetched = useAppSelector((state) => state.conversations.isFetched);
    const userEmail = session?.user?.email;

    useEffect(() => {
        let unsubscribeConversations: Unsubscribe;
        const unsubscribeMessagesFunctions: Unsubscribe[] = [];

        if (userEmail) {
            unsubscribeConversations = onSnapshot(
                query(
                    collection(db, "conversations"),
                    where("userId", "==", userEmail),
                    orderBy("timestamp", "asc")
                ),
                (conversationsSnapshot) => {
                    const conversations = conversationsSnapshot.docs.map(doc => (
                        { id: doc.id, ...doc.data(), messages: [] as Message[] } as Conversation
                    ));
                    dispatch(updateConversations(conversations));

                    if (conversations.length === 0) {
                        dispatch(setIsFetched(true));  // No conversations, so fetching is complete
                    } else {
                        conversations.forEach((conversation) => {
                            const unsubscribeMessages = onSnapshot(
                                query(
                                    collection(db, "conversations", conversation.id, "messages"),
                                    orderBy("timestamp", "asc")
                                ),
                                (messagesSnapshot) => {
                                    const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
                                    dispatch(updateMessages({ conversationId: conversation.id, messages }));
                                }
                            );
                            unsubscribeMessagesFunctions.push(unsubscribeMessages);
                        });
                        dispatch(setIsFetched(true));  // Listeners are set up, consider fetching complete
                    }
                }
            );

            return () => {
                if (unsubscribeConversations) unsubscribeConversations();
                unsubscribeMessagesFunctions.forEach(unsubscribe => unsubscribe());
            };
        }
    }, [userEmail, dispatch]);


    return (
        <div className="p-d flex flex-col h-screen">
            <div className="flex-1">
                <div>
                    <div className="flex flex-col space-y-2">
                        {!isFetched &&
                            <div className="animate-pulse text-center text-white">Loading...</div>
                        }
                        {/* Map through the conversation rows */}
                        {conversations?.map((conversation) => {
                            return <ConversationRow key={conversation.id} conversationId={conversation.id} />
                        })}
                    </div>
                </div>
            </div>
            {session && (
                <img
                    src={session?.user?.image || ""}
                    onClick={() => signOut()}
                    alt="Profile Picture"
                    className="h-12 w-12 rounded-full cursor-pointer mx-auto mb-2 hover:opacity-50"
                />
            )}
        </div>
    );
}

export default SideBar;