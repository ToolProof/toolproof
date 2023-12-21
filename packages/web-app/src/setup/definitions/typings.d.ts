//ATTENTION: These can now be moved to the monorepo root, but I'm leaving them here for now for reference

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