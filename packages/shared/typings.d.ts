import { Timestamp, FieldValue } from "firebase/firestore";

export interface Message {
    timestamp: Timestamp | FieldValue;  //ATTENTION: possibly corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: Timestamp | FieldValue; //ATTENTION: possibly corrupted type    
    userId: string;
    turnState: number;
    z: number;
}