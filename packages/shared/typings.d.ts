//import { Timestamp, FieldValue } from "firebase/firestore";

export interface Message {
    //timestamp: Timestamp | FieldValue;  //ATTENTION: possibly corrupted type  
    timestamp: FirebaseFirestore.Timestamp;  
    userId: string;
    content: string;
}

export interface Conversation {
    //timestamp: Timestamp | FieldValue; //ATTENTION: possibly corrupted type    
    timestamp: FirebaseFirestore.Timestamp;
    userId: string;
    turnState: number;
    z: number;
}