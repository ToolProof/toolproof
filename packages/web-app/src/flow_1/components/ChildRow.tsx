import { ConversationRead } from "shared/src/flow_0/typings";
import Link from "next/link";

type Props = {
    conversation: ConversationRead;
    index: number;
};

export default function ChildRow({ conversation, index }: Props) {
    const href = `/flow_1/${conversation.idPath}`; //ATTENTION: hardcoded flow_1
    //const href = `/flow_${index}/${conversation.idPath}`;
    console.log(index) // ATTENTION: eslint hack


    return ( // ${conversation.type === DATA ? 'bg-gray-200' : 'bg-gray-700'}
        <Link href={href}>
            <div className={`flex justify-center items-center text-white
                
            `}>
                {conversation.id}
            </div>
        </Link>
    )
}