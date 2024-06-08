import * as TYPES from './types';
import fs from 'fs';

function parseInternals(): TYPES.InternalConcepts {
    const filePath = '../../vlogtalks/internals/internals.md';
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    const internalConcepts: Partial<TYPES.InternalConcepts> = {};

    let currentConcept: TYPES.Concept | null = null;
    let currentConceptName: string | null = null;

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('* **')) {
            const conceptName = line.match(/\*\*\s*(.*?)\s*\*\*/)?.[1];
            if (conceptName) {
                currentConceptName = conceptName;
                const concept = createConcept(conceptName);
                if (concept) {
                    internalConcepts[conceptNameToKey(conceptName)] = concept;
                    currentConcept = concept;
                }
            }
        } else if (line.startsWith('* Definition') && currentConceptName) {
            const concept = internalConcepts[conceptNameToKey(currentConceptName)];
            if (concept) {
                concept.definition = line;
            }
        }
    }

    return internalConcepts as TYPES.InternalConcepts;
}

function createConcept(conceptName: string): TYPES.Concept | null {
    switch (conceptName) {
        case 'SequenceDraftConcept':
            return { id: '1', name: 'SequenceDraftConcept', definition: '' } as TYPES.Concept;
        case 'VideoDraftConcept':
            return { id: '2', name: 'VideoDraftConcept', definition: '' } as TYPES.Concept;
        case 'Story':
            return { id: '3', name: 'Story', definition: '' } as TYPES.Concept;
        case 'Debate':
            return { id: '4', name: 'Debate', definition: '' } as TYPES.Concept;
        case 'Interview':
            return { id: '5', name: 'Interview', definition: '' } as TYPES.Concept;
        case 'Tutorial':
            return { id: '6', name: 'Tutorial', definition: '' } as TYPES.Concept;
        case 'Initial':
            return { id: '7', name: 'Initial', definition: '' } as TYPES.Concept;
        case 'Response':
            return { id: '8', name: 'Response', definition: '' } as TYPES.Concept;
        default:
            return null;
    }
}

function conceptNameToKey(conceptName: string): keyof TYPES.InternalConcepts {
    switch (conceptName) {
        case 'SequenceDraftConcept':
            return 'sequenceDraftConcept';
        case 'VideoDraftConcept':
            return 'videoDraftConcept';
        case 'Story':
            return 'storyConcept';
        case 'Debate':
            return 'debateConcept';
        case 'Interview':
            return 'interviewConcept';
        case 'Tutorial':
            return 'tutorialConcept';
        case 'Initial':
            return 'initialConcept';
        case 'Response':
            return 'responseConcept';
        default:
            throw new Error(`Unknown concept name: ${conceptName}`);
    }
}

function parseDrafts() {
    const filePath = '../../vlogtalks/drafts/should-i-stop-smoking-weed.md';
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const internalConcepts = parseInternals();

    const lines = fileContent.split('\n');

    // sequenceDraft can be made initially as we know it'll exist
    let sequenceDraft: TYPES.SequenceDraft = { id: '', title: '', sequenceDraftConcept: { ...internalConcepts.sequenceDraftConcept, sequenceType: internalConcepts.debateConcept }, children: [] }; // ATTENTION: determine contextually later
    let currentVideoDraft: TYPES.VideoDraft | null = null;

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('* **SequenceDraft**')) {
            sequenceDraft.id = '1';
        } else if (line.startsWith('* **Story**')) {
            sequenceDraft.sequenceDraftConcept.sequenceType = internalConcepts.storyConcept;
        } else if (line.startsWith('* **Debate**')) {
            sequenceDraft.sequenceDraftConcept.sequenceType = internalConcepts.debateConcept;
        } else if (line.startsWith('* **Interview**')) {
            sequenceDraft.sequenceDraftConcept.sequenceType = internalConcepts.interviewConcept;
        }
        else if (line.startsWith('* **Tutorial**')) {
            sequenceDraft.sequenceDraftConcept.sequenceType = internalConcepts.tutorialConcept;
        } else if (line.startsWith('* Title:')) {
            sequenceDraft.title = line; // ATTENTION: consider removing the prefix
        } else if (line.startsWith('* **VideoDraft**')) {
            // Create VideoDraft and push it to the children array of sequenceDraft
            if (currentVideoDraft) {
                sequenceDraft.children.push(currentVideoDraft);
            }
            currentVideoDraft = { id: (sequenceDraft.children.length + 1).toString(), content: '', videoDraftConcept: { id: '', content: '', videoType: { id: '', content: '' } } };
        } else if (line.startsWith('* **Initial**')) {
            if (currentVideoDraft) {
                currentVideoDraft.videoConcept = {
                    id: '1',
                    content: 'Initial',
                    videoType: { id: '1', content: 'Initial' }
                };
            }
        } else if (line.startsWith('* **Response**')) {
            if (currentVideoDraft) {
                currentVideoDraft.videoConcept = {
                    id: '2',
                    content: 'Response',
                    videoType: { id: '2', content: 'Response' }
                };
            }
        } else if (line.startsWith('* Content:')) {
            if (currentVideoDraft) {
                currentVideoDraft.content = line.replace('* Content:', '').trim();
            }
        }
    }

    if (currentVideoDraft) {
        sequenceDraft.children.push(currentVideoDraft);
    }

    return sequenceDraft;
}

// Example usage
// const sequenceDraft = parseDrafts();
// console.log(JSON.stringify(sequenceDraft, null, 2));

const concepts = parseInternals();
console.log(JSON.stringify(concepts, null, 2));