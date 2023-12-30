import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { createConversationInFirestore } from "../lib/utils";
import { getDocs, query, where, collection, orderBy, limit } from "firebase/firestore";
import { db } from "shared/firebaseClient";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = session?.user?.email;

  useEffect(() => {
    const checkAndCreateConversation = async () => {
      if (userEmail) {
        const q = query(
          collection(db, "conversations"),
          where("userId", "==", userEmail),
          orderBy("timestamp", "asc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          // Create conversation only if none exists
          const conversationId = await createConversationInFirestore(session, "base", 1);
          if (conversationId) {
            router.push(`/conversation/${conversationId}`);
          }
        }
      }
    };

    checkAndCreateConversation();
  }, [userEmail, session, router]);

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
