import Conversation from "../../../components/Conversation-Unsigned";
import ConversationInput from "../../../components/ConversationInput-Unsigned";

type Props = {
    params: {
        id: string;
    }
}

function ConversationPage({params: {id}}: Props) {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Conversation conversationId={id}/>
            <ConversationInput conversationId={id}/>
        </div>
    );
}

export default ConversationPage;