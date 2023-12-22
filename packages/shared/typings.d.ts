import { Timestamp } from "firebase/firestore";

export interface Message {
    timestamp: Timestamp;  //ATTENTION: possibly corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: Timestamp; //ATTENTION: possibly corrupted type    
    userId: string;
    turnState: number;
    z: number;
}