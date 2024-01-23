import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageRead {
    id: string;
    userId: string;
    timestamp: Timestamp;
    content: string;
}

export interface ConversationRead {
    id: string;
    userId: string;
    type: string;
    timestamp: Timestamp;
    turnState: number;
}

export interface MessageWrite {
    userId: string;
    content: string;
}

export interface ConversationWrite {
    userId: string;
    type: string;
    turnState: number;
}
