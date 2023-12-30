"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { createConversationInFirestore } from "../lib/utils";


import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { db } from "shared/firebaseClient";


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();


  const userEmail = session?.user?.email;
  const conversationsQuery = userEmail ? query(
    collection(db, "conversations"),
    where("userId", "==", userEmail),
    orderBy("timestamp", "asc")
  ) : null;
  const [conversations] = useCollection(conversationsQuery);


  useEffect(() => {
    const foo = async () => {
      if (session && conversations?.docs.length === 0) {
        const conversationId = await createConversationInFirestore(session, "base", 1);
        if (conversationId) {
          router.push(`/conversation/${conversationId}`);
        }
      }
    }
    foo();
  }, [session, router, conversations]);

  return (
    <div className="baseBackground flex flex-col items-center justify-center h-screen">
      <div className="text-black text-5xl mb-4">toolproof.com</div>
      {
        session?.user?.email === "renestavnes@hotmail.com" &&
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