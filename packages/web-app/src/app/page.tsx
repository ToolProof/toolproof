"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useGlobalContext } from "./components/GlobalContextProvider";
import { createConversationInFirestore } from "../lib/utils";


export default function Home() {
  const { data: session } = useSession();
  const { isAlfa } = useGlobalContext();

  return (
    <div className="baseBackground flex flex-col items-center justify-center h-screen">
      <div className="text-black text-5xl mb-4">toolproof.com</div>
      {
        //session?.user?.email === "renestavnes@hotmail.com" &&
        <div className="flex">
          {!session ? (
            <button onClick={() => signIn("google")} className="text-black font-bold text-3xl animate-pulse">Sign In</button> //ATTENTION: project-number shown in google sign-in
          ) : isAlfa ? (
            <AlfaMode session={session} />
          ) : (
            <BetaMode session={session} />
          )}
        </div>

      }
    </div>
  );
}


type ModeProps = {
  session: Session;
};


function AlfaMode({ session }: ModeProps) {
  const router = useRouter();

  const handleClick = async () => {
    const conversationId = await createConversationInFirestore(session, "base", 1);
    if (conversationId) {
      router.push(`/conversation/${conversationId}`);
    }
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md"
      onClick={handleClick}
    >
      Create Conversation
    </button>
  );
}


function BetaMode({ session }: ModeProps) {
  const [input, setInput] = useState("");

  const sendInvitation = async (email: string, invitationLink: string) => {
    try {
      const response = await fetch("/api/sendInvitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, invitationLink }),
      });

      if (response.ok) {
        console.log("Server response:");
      } else {
        console.error("Failed to send invitation");
      }
    } catch (error: unknown) {
      // Check if error is an instance of Error
      if (error instanceof Error) {
        console.error("Error sending invitation:", error.message);
      } else {
        console.error("Error sending invitation: An unknown error occurred");
      }
    }
  };

  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const conversationId = await createConversationInFirestore(session, "base", 2);
    if (conversationId) {
      const invitationLink = `https://www.toolproof.com/conversation/invitee/${conversationId}`;
      await sendInvitation(input, invitationLink);
      setInput("");
    } 
  }

  return (
    <form onSubmit={handleClick}>
      <input
        type="email"
        placeholder="Enter invitee's email"
        className="p-2 rounded-l-md border border-gray-300 w-96 mr-4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md" type="submit">
        Send
      </button>
    </form>
  );
}


