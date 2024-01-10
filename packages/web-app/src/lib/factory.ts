
import { serverTimestamp } from "firebase/firestore";
import { ConversationWrite, MessageWrite } from "shared/typings";

export function createMessageWrite({ userId, content }: { userId: string; content: string; }): MessageWrite {
    return {
        userId,
        content,
        timestamp: serverTimestamp(),
    };
}

export function createConversationWrite({ parentId, userId, turnState }: { parentId: string; userId: string; turnState: number; }): ConversationWrite {
    return {
        parentId,
        userId,
        turnState,
        timestamp: serverTimestamp(),
    };
}

/* export function createMessageRead(): MessageRead {
    return {
        
    };
}

export function createConversationRead(): ConversationRead {
    return {

    };
} */

