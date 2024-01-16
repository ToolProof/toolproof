import Conversation from "./components/CO";
import ConversationInput from "./components/CI";

function ConversationPage() {

    const id = "vvrMuUswgrTvRj3yzIIN";

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            <div className="flex-1 my-8">
                <Conversation key={id} conversationId={id} />
            </div>
            <div>
                <ConversationInput conversationId={id} />
            </div>
        </div>
    );
}

export default ConversationPage;