import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageRead {
    id: string;
    userId: string;
    timestamp: Timestamp;
    content: string;
}

export interface MessageWrite {
    userId: string;
    content: string;
}

export interface ConversationRead {
    id: string;
    path: string;
    userId: string;
    type: string;
    timestamp: Timestamp;
    turnState: number;
}

export interface ConversationWrite {
    path: string;
    userId: string;
    type: string;
    turnState: number;
}
