
import { serverTimestamp } from "firebase/firestore";
import { ConversationWrite, MessageWrite } from "shared/typings";

export function createMessageWrite(userId: string, content: string): MessageWrite {
    return {
        userId,
        content,
        timestamp: serverTimestamp(),
    };
}

export function createConversationWrite(parentId: string, userId: string, turnState: number): ConversationWrite {
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

