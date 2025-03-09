import { Timestamp } from "firebase/firestore";


export interface MessageWrite {
    userId: string;
    content: string;
    isMeta: boolean;
    tags: string[];   
}


export interface MessageRead extends MessageWrite {
    id: string;
    timestamp: Timestamp;
}


export interface ChatWrite {
    userId: string;
    turnState: number;
    tags: string[];
}


export interface ChatRead extends ChatWrite {
    id: string;
    timestamp: Timestamp;
}
