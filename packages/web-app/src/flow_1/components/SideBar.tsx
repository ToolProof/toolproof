"use client"
//import * as Constants from "shared/src/flow_0/constants";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react"
//import { useRouter } from "next/navigation";
import ConversationRow from "./ConversationRow";
//import { addGenesisConversation, replaceSlashWithTilde } from "../lib/firestoreHelpersClient";
import { useAppDispatch } from "@/flow_1/lib/redux/hooks";
import { setUserEmail } from "@/flow_1/lib/redux/features/devConfigSlice";
import { useAppSelector } from "@/flow_1/lib/redux/hooks";
import { ConversationRead } from "shared/src/flow_0/typings";

type Props = {
    genesisConversations: ConversationRead[];
    setIndex: (index: number) => void;
}


export default function SideBar({ genesisConversations, setIndex }: Props) {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    //const router = useRouter();
    const dispatch = useAppDispatch();
    const loading = false; //ATTENTION: This is a placeholder for now

    const isApproved = useAppSelector(state => state.devConfig.isApproved);

    useEffect(() => {
        dispatch(setUserEmail(userEmail));
    }, [dispatch, userEmail]);

    if (!isApproved) {
        return (
            <div></div>
        )
    }

    /* const handleClick = async () => {
        if (userEmail) {
            try {
                const result = await addGenesisConversation({ userId: userEmail, type: Constants.META, turnState: 0, path: "" });
                if (result && result.path) {
                    router.push(`/conversation/${replaceSlashWithTilde(result.path)}`);
                } else {
                    console.error("Conversation creation did not return a valid ID");
                }
            } catch (err) {
                console.error("Failed to create conversation", err);
            }
        };
    } */


    return (
        <div className="flex flex-col h-screen py-4 overflow-x-hidden">
            {/* <button
                    className="flex justify-center items-center h-12 bg-white text-black"
                    onClick={handleClick}
                >
                    <p>Create New Meta Conversation</p>
            </button> */}
            <div className="flex-1">
                <div className="flex flex-col space-y-2">
                    {loading &&
                        <div className="animate-pulse text-center text-white">Loading...</div>
                    }
                    {genesisConversations.map((conversation, index) => {
                        return <ConversationRow key={conversation.id} conversation={conversation} index={index} setIndex={setIndex} />
                    })}
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
