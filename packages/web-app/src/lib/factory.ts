
import { Timestamp, FieldValue, serverTimestamp } from "firebase/firestore";
import { Conversation, Message } from "shared/typings";

export function createMessageForWrite(userId: string, content: string): Message<FieldValue> {
    return {
        userId,
        content,
        timestamp: serverTimestamp(),
    };
}

export function createConversationForWrite(parentId: string, userId: string, turnState: number): Conversation<FieldValue> {
    return {
        parentId,
        userId,
        turnState,
        timestamp: serverTimestamp(),
        messages: [],
    };
}

export function createMessageForRead(id: string, userId: string, content: string, timestamp: Timestamp): Message<Timestamp> {
    return {
        id,
        userId,
        content,
        timestamp,
    };
}

export function createConversationForRead(id: string, parentId: string, userId: string, turnState: number, timestamp: Timestamp, messages: Message<Timestamp>[]): Conversation<Timestamp> {
    return {
        parentId,
        userId,
        turnState,
        timestamp,
        messages,
    };
}

