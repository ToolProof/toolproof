"use client";
import ChildRow from "./ChildRow";
import { useChildConversations } from "@/lib/firestoreHelpersClient";
import { ConversationRead } from "shared/src/flow_0/typings";

type Props = {
    genesisConversation: ConversationRead;
    indexParent: number;
  }

  export default function ChildBar({ genesisConversation, indexParent }: Props) {
    const { conversations: childConversations } = useChildConversations(genesisConversation.path);

    return (
        <div className="flex flex-col space-y-4">
            {
                childConversations?.map((conversation) => (
                    <ChildRow key={conversation.id} conversation={conversation} index={indexParent}/>
                ))
            }
        </div>
    )

}