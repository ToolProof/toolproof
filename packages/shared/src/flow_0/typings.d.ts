import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageRead {
    id: string;
    timestamp: Timestamp;
    userId: string;
    content: string;
}

export interface MessageWrite {
    userId: string;
    content: string;
}

export interface ChatRead {
    id: string;
    timestamp: Timestamp;
    userId: string;
    turnState: number;
}

export interface ChatWrite {
    userId: string;
    turnState: number;
}
