"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Sidebar from "./SideBar";
import ChildBar from "./ChildBar";
import { useGenesisConversations } from "@/lib/firestoreHelpersClient";

export default function Bars() {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "";
    const { conversations: genesisConversations } = useGenesisConversations(userEmail);
    const [index, setIndex] = useState(-1);

    // Conditional rendering logic and variable assignment
    let childBarContent = null;
    const genesisConversation = genesisConversations[index]; //ATTENTION: why can't I do this in the return statement?
    childBarContent = (
        <div className="h-full w-80 py-4 bg-[#c96565]">
            {
                index !== -1 &&
                <ChildBar genesisConversation={genesisConversation} indexParent={index} />
            }

        </div>
    );

    return ( //ATTENTION: why can't css classes be applied to custom components?
        <>
            <div className="h-full w-80 py-4 bg-black"> 
                <Sidebar genesisConversations={genesisConversations} setIndex={setIndex} />
            </div>
            {childBarContent}
        </>
    );
}
