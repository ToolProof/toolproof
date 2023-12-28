import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageWrite {
    timestamp: FieldValue;     
    userId: string;
    content: string;
}

export interface MessageRead {
    timestamp: Timestamp;  
    userId: string;
    content: string;
}

export interface ConversationWrite {
    timestamp: FieldValue;   
    userId: string;
    parentId: string;
    turnState: number;
    y: number;
    z: number;
}

export interface ConversationRead {
    timestamp: Timestamp;    
    userId: string;
    parentId: string;
    turnState: number;
    y: number;
    z: number;
}

