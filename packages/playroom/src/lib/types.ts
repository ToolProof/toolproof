
export interface SequenceDraft {
    id: string;
    title: string;
    sequenceDraftConcept: SequenceDraftConcept;
    children: VideoDraft[];
}

export interface VideoDraft {
    id: string;
    content: string;
    videoDraftConcept: VideoDraftConcept;
}

export interface Concept {
    id: string;
    definition: string;
}

export interface StoryConcept extends Concept {
}

export interface DebateConcept extends Concept {
}

export interface InterviewConcept extends Concept {
}

export interface TutorialConcept extends Concept {
}

export type SequenceType = StoryConcept | DebateConcept | InterviewConcept | TutorialConcept;

export interface SequenceDraftConcept extends Concept {
    sequenceType: SequenceType;
}

export interface InitialConcept extends Concept {
}

export interface ResponseConcept extends Concept {
}

export type VideoType = InitialConcept | ResponseConcept;

export interface VideoDraftConcept extends Concept {
    videoType: VideoType;
}

export interface InternalConcepts {
    sequenceDraftConcept: Concept;
    videoDraftConcept: Concept;
    storyConcept: Concept;
    debateConcept: Concept;
    interviewConcept: Concept;
    tutorialConcept: Concept;
    initialConcept: Concept;
    responseConcept: Concept;
}

