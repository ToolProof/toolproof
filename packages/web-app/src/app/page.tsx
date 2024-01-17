"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useConversations, addConversation } from "../lib/firestoreHelpersClient";


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email || "";
  const { conversations } = useConversations(userEmail);
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    const checkAndHandleConversation = async () => {
      if (userEmail) {
        if (conversations.length === 0 && !isCreated) { //ATTENTION: asynchronous updates of isCreated
          try {
            const result = await addConversation({ parentId: "base", userId: userEmail, turnState: 0 });
            if (result && result.data && result.data.conversationId) {
              router.push(`/conversation/${result.data.conversationId}`);
              setIsCreated(true);
            } else {
              console.error("Conversation creation did not return a valid ID");
            }
          } catch (err) {
            console.error("Failed to create conversation", err);
          }
        } else {
          // Redirect to the first conversation
          const existingConversationId = conversations[0].id;
          setIsCreated(true);
          router.push(`/conversation/${existingConversationId}`);
        }
      }
    };

    checkAndHandleConversation();
  }, [isCreated, userEmail, conversations, router]);
  

  return (
    <div className="baseBackground flex flex-col items-center justify-center h-screen">
      <div className="text-black text-5xl mb-4">toolproof.com</div>
      {
        userEmail === "renestavnes@hotmail.com" &&
        <div className="flex">
          {!session && (
            <button onClick={() => signIn("google")} className="text-black font-bold text-3xl animate-pulse">Sign In</button> //ATTENTION: project-number shown in google sign-in
          )
          }
        </div>
      }
    </div>
  );
}
