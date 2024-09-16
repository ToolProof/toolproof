import { Timestamp } from "firebase/firestore";

export interface MessageWrite {
    userId: string;
    content: string;
    tags: string[]; // ATTENTION: consider contentCode (like for VlogTalk) on the Concept instead of test-tag on the Message
}

export interface MessageRead extends MessageWrite {
    id: string;
    timestamp: Timestamp;
}

export interface MessageReadWithoutTimestamp extends MessageWrite {
    id: string;
}


// ATTENTION: note the difference between RelatedConcept and Relationship

export interface ConceptWrite {
    _name: string;
    relatedConcepts: RelatedConceptWrite[];
    userId: string;
}

export interface ConceptRead extends ConceptWrite {
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



