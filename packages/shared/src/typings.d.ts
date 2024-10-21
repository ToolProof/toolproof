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

export interface MessageReadWithoutTimestamp extends MessageWrite {
    id: string;
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

export interface RelatedConceptWrite {
    relatedConceptId: string;
    relationshipId: string; // definition, synonyms, examples, etc.
    userId: string;
}

export interface RelatedConceptRead extends RelatedConceptWrite {
    id: string;
    timestamp: Timestamp;
}

// ATTENTION: note the difference between RelatedConcept and Relationship



