//ATTENTION: These should be defined in a dependency, not in the project itself

export interface Message {
    timestamp: Firestore.Timestamp; //ATTENTION: corrupted type    
    userId: string;
    content: string;
}

export interface Conversation {
    timestamp: Firestore.Timestamp; //ATTENTION: corrupted type    
    userId: string;
    turnState: number;
    z: number;
}