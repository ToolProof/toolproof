"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { useAddConversationMutation } from "@/redux/features/rtkQuerySlice";
import addConversationHelper from "@/lib/addConversationHelper";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email;
  const isFetched = useAppSelector((state) => state.conversations.isFetched);
  const conversations = useAppSelector((state) => state.conversations.conversations);
  const [addConversation] = useAddConversationMutation();

  useEffect(() => {
    const checkAndHandleConversation = async () => {
      if (userEmail && isFetched) {
        if (conversations.length === 0) {
          // Create a new conversation
          try {
            const newConversation = addConversationHelper(userEmail, "base");
            const result = await addConversation(newConversation).unwrap();
            if (result && result.conversationId) {
              router.push(`/conversation/${result.conversationId}`);
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
  }, [userEmail, isFetched, conversations, addConversation, router]);

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
