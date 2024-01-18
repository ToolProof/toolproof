"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useConversations, addConversation } from "../lib/firestoreHelpersClient";


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email || "";
  const { conversations, loading } = useConversations(userEmail);

  useEffect(() => {
    console.log("loading", loading);
    console.log("conversations.length", conversations.length);
    const checkAndHandleConversation = async () => {
      if (userEmail) {
        if (loading) {
          return;
        }
        if (conversations.length === 0) { //ATTENTION: asynchronous updates of isCreated
          try {
            const result = await addConversation({ parentId: "base", userId: userEmail, turnState: 0 });
            if (result && result.data && result.data.conversationId) {
              router.push(`/conversation/${result.data.conversationId}`);
            } else {
              console.error("Conversation creation did not return a valid ID");
            }
          } catch (err) {
            console.error("Failed to create conversation", err);
          }
        } else {
          // Redirect to the first conversation
          const existingConversationId = conversations[0].id;
          router.push(`/conversation/${existingConversationId}`);
        }
      }
    };

    checkAndHandleConversation();
  }, [userEmail, loading, conversations, router]);
  

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
