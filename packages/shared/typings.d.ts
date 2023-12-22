import { Timestamp, FieldValue } from "firebase/firestore";

export interface MessageWrite {
    timestamp: FieldValue;  //ATTENTION: possibly corrupted type    
    userId: string;
    content: string;
}

export interface MessageRead {
    timestamp: Timestamp;  //ATTENTION: possibly corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: Timestamp | FieldValue; //ATTENTION: possibly corrupted type    
    userId: string;
    turnState: number;
    z: number;
}