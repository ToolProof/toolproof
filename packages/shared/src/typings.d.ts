import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageWrite {
    userId: string;
    content: string;
    tags: string[]; // ATTENTION: consider contentCode (like for VlogTalk) on the Chat instead of test-tag on the Message
}

export interface MessageRead extends MessageWrite {
    id: string;
    timestamp: Timestamp;
}

export interface MessagePinecone extends MessageWrite {
    id: string;
}

export interface ChatWrite {
    userId: string;
    turnState: number;
}

export interface ChatRead extends ChatWrite {
    id: string;
    timestamp: Timestamp;
}

