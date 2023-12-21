import { FieldValue } from "firebase/firestore";

export interface Message {
    timestamp: FieldValue; //ATTENTION: possibly corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: FieldValue; //ATTENTION: possibly corrupted type    
    userId: string;
    turnState: number;
    z: number;
}