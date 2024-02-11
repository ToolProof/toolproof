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

export interface ChatRead {
    id: string;
    path: string;
    idPath: string;
    userId: string;
    type: string;
    timestamp: Timestamp;
    turnState: number;
}

export interface ChatWrite {
    path: string;
    userId: string;
    type: string;
    turnState: number;
}
