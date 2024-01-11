import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageRead {
    id: string;
    userId: string;
    timestamp: Timestamp;
    content: string;
}

export interface ConversationRead {
    id: string;
    parentId: string;
    userId: string;
    timestamp: Timestamp;
    turnState: number;
    messages: MessageRead[];
}

export interface MessageWrite {
    userId: string;
    content: string;
}

export interface ConversationWrite {
    parentId: string;
    userId: string;
    turnState: number;
}
