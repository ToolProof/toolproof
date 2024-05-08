import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageWrite {
    userId: string;
    content: string;
    tags: string[]; // ATTENTION: consider contentCode (like for VlogTalk) on the Concept instead of test-tag on the Message
}

export interface MessageRead extends MessageWrite {
    id: string;
    timestamp: Timestamp;
}

export interface MessageReadWithoutTimestamp extends MessageWrite {
    id: string;
}

export interface ConceptWrite {
    userId: string;
    turnState: number;
}

export interface ConceptRead extends ConceptWrite {
    id: string;
    timestamp: Timestamp;
}

