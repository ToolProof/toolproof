"use client"
import { signIn, useSession } from "next-auth/react";
import { useAppSelector } from "@/lib/redux/hooks";


export default function Home() {
  const { data: session } = useSession();

  const isApproved = useAppSelector(state => state.devConfig.isApproved);


  return (
    <div className="baseBackground flex flex-col items-center justify-center h-screen">
      <div className="text-black text-5xl mb-4">toolproof.com</div>
      {
        isApproved &&
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
