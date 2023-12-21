import { Timestamp} from "firebase/firestore";

export interface Message {
    timestamp: Timestamp; //ATTENTION: corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: Timestamp; //ATTENTION: corrupted type    
    userId: string;
    turnState: number;
    z: number;
}