import { Timestamp, FieldValue } from "firebase/firestore";

export interface Message {
    id: string;
    userId: string;
    timestamp: Timestamp;
    content: string;
}

export interface Conversation {
    id: string;
    parentId: string;
    userId: string;
    timestamp: Timestamp;
    turnState: number;
    messages: Message[];
}

export interface MessageWrite {
    timestamp: FieldValue;
    userId: string;
    content: string;
}

export interface Conversation {
    parentId: string;
    userId: string;
    timestamp: FieldValue;
    turnState: number;
    messages: Message[];
}

