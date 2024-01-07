"use client"
import { useSession, signOut } from "next-auth/react"
//import { useCollection } from "react-firebase-hooks/firestore";
import { collection, onSnapshot} from "firebase/firestore";
import { db } from "shared/firebaseClient";
import ConversationRow from "./ConversationRow";
import { useEffect } from "react";
import { updateConversations } from "@/redux/features/conversationsSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";

function SideBar() {
    const { data: session } = useSession(); 
    const dispatch = useAppDispatch();
    // Using useSelector for data managed by traditional Redux slices
    const conversations = useAppSelector((state) => state.conversations.conversations);
    const isLoading = false; // TODO: Implement loading state

    /* const userEmail = session?.user?.email;

    const conversationsQuery = userEmail ? query(
        collection(db, "conversations"),
        where("userId", "==", userEmail),
        orderBy("timestamp", "asc")
    ) : null;    

    const [conversations, isLoading] = useCollection(conversationsQuery); //ATTENTION_
    console.log("isLoading: ", isLoading); // Debug line
    console.log("conversations: ", conversations); // Debug line */

    useEffect(() => {
        if (session?.user?.email) {
          const unsubscribe = onSnapshot(collection(db, "conversations"), (snapshot) => {
            //const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dispatch(updateConversations(snapshot));
          });
    
          return () => unsubscribe();
        }
      }, [session?.user?.email, dispatch]);


    return (
        <div className="p-d flex flex-col h-screen">
            <div className="flex-1">
                <div>
                    <div className="flex flex-col space-y-2">
                        {isLoading &&
                            <div className="animate-pulse text-center text-white">Loading...</div>
                        }
                        {/* Map through the conversation rows */}
                        {conversations?.docs.map((conversation) => {
                            return <ConversationRow key={conversation.id} conversationId={conversation.id} isSigned={true} /> 
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