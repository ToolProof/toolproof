import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType } from './types';


export const gridSize = 12;
export const cellWidth = 120;
export const cellHeight = 60;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(5, 5, cellWidth, cellHeight), 'lg', 'code', true),
    Human: new Resource(new Cell(5, 7, cellWidth, cellHeight), 'vercel', 'code', true),
    Simulation: new Resource(new Cell(5, 3, cellWidth, cellHeight), 'gcp', 'code', true),
    Anchors: new Resource(new Cell(2, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    AnchorsGlue: new Resource(new Cell(3, 3, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Candidates: new Resource(new Cell(4, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    CandidatesGlue: new Resource(new Cell(5, 3, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Results: new Resource(new Cell(6, 1, cellWidth, cellHeight), 'gcp', 'data', false),
    ResultsGlue: new Resource(new Cell(4, 4, cellWidth, cellHeight), 'gcp', 'code_glue', false),
    Papers: new Resource(new Cell(8, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    PapersGlue: new Resource(new Cell(5, 2, cellWidth, cellHeight), 'gcp', 'code_glue', true),
} as const;


export const arrows: Record<ArrowNameType, Arrow> = {
    Human_Anchors: new Arrow(['Human', 'left'], ['Anchors', 'left'], resources),
    Agent_Anchors: new Arrow(['Agent', 'left'], ['Anchors', 'bottom'], resources),
    Anchors_Agent: new Arrow(['Anchors', 'bottom'], ['Agent', 'left'], resources),
    Agent_Candidates: new Arrow(['Agent', 'top'], ['Candidates', 'bottom'], resources),
    Candidates_Simulation: new Arrow(['Candidates', 'right'], ['Simulation', 'top'], resources),
    Simulation_Results: new Arrow(['Simulation', 'top'], ['Results', 'left'], resources),
    Results_Agent: new Arrow(['Results', 'bottom'], ['Agent', 'top'], resources),
    Agent_Papers: new Arrow(['Agent', 'right'], ['Papers', 'bottom'], resources),
    Agent_Human: new Arrow(['Agent', 'bottom'], ['Human', 'top'], resources),
    Human_Agent: new Arrow(['Human', 'top'], ['Agent', 'bottom'], resources),
    Papers_Human: new Arrow(['Papers', 'right'], ['Human', 'right'], resources),
    Agent_Agent: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources),
};


export const sequence: Array<[GraphElementNameType[], string]> = [
    [['Human', 'Human_Anchors', 'Anchors'],
        'Humans can upload Anchors, which serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'],
    [['Anchors', 'Anchors_Agent', 'Agent', 'Agent_Candidates', 'Candidates'],
        'The Agent retrieves one or more Anchors. Using its parametric knowledge, the Agent suggests modifications to an Anchor and generates a Candidate.'],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
        ''],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers'],
        'Simulation results, available in various file formats depending on the Simulation tools used, are presented to the Agent for analysis.'],
    [['Papers', 'Papers_Human', 'Human'],
        'A Paper documents the Agent’s reasoning, the Simulation process, and outcomes, offering suggestions for further action or future research.'],
];