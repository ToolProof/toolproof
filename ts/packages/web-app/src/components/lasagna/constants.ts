import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType } from './types';


export const gridSize = 10;
export const cellWidth = 140;
export const cellHeight = 70;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(3, 3, cellWidth, cellHeight), 'lg', 'code', true),
    Human: new Resource(new Cell(3, 1, cellWidth, cellHeight), 'vercel', 'code', true),
    Simulation: new Resource(new Cell(7, 4, cellWidth, cellHeight), 'gcp', 'code', true),
    Anchors: new Resource(new Cell(1, 3, cellWidth, cellHeight), 'gcp', 'data', true),
    AnchorsGlue: new Resource(new Cell(2, 3, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Candidates: new Resource(new Cell(5, 3, cellWidth, cellHeight), 'gcp', 'data', true),
    CandidatesGlue: new Resource(new Cell(4, 3, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Results: new Resource(new Cell(5, 5, cellWidth, cellHeight), 'gcp', 'data', false),
    ResultsGlue: new Resource(new Cell(3, 4, cellWidth, cellHeight), 'gcp', 'code_glue', false),
    Papers: new Resource(new Cell(5, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    PapersGlue: new Resource(new Cell(4, 2, cellWidth, cellHeight), 'gcp', 'code_glue', true),
} as const;


export const arrows: Record<ArrowNameType, Arrow> = {
    Agent_Candidates: new Arrow(['Agent', 'right'], ['Candidates', 'left'], resources, cellWidth, cellHeight),
    Candidates_Simulation: new Arrow(['Candidates', 'right'], ['Simulation', 'top'], resources, cellWidth, cellHeight),
    Simulation_Results: new Arrow(['Simulation', 'bottom'], ['Results', 'right'], resources, cellWidth, cellHeight),
    Results_Agent: new Arrow(['Results', 'left'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
    Agent_Anchors: new Arrow(['Agent', 'left'], ['Anchors', 'right'], resources, cellWidth, cellHeight),
    Anchors_Agent: new Arrow(['Anchors', 'right'], ['Agent', 'left'], resources, cellWidth, cellHeight),
    Agent_Human: new Arrow(['Agent', 'top'], ['Human', 'bottom'], resources, cellWidth, cellHeight),
    Human_Agent: new Arrow(['Human', 'bottom'], ['Agent', 'top'], resources, cellWidth, cellHeight),
    Agent_Papers: new Arrow(['Agent', 'right'], ['Papers', 'left'], resources, cellWidth, cellHeight),
    Papers_Human: new Arrow(['Papers', 'left'], ['Human', 'right'], resources, cellWidth, cellHeight),
    Agent_Agent: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
};


export const sequence: Array<[GraphElementNameType, string]> = [
    ['Agent',
        'The Agent is pre-configured to collaborate with humans and tools for drug discovery focused on a specified disease. Each workflow iteration typically begins with the Agent deciding to retrieve Anchors.'],
    ['Agent_Anchors',
        ''],
    ['Anchors',
        'Anchors serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. However, it can also be a drug for another disease if the pathology involves the same biomolecules or molecular pathways. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'],
    ['Anchors_Agent',
        ''],
    ['Agent',
        'Using its parametric knowledge, the Agent suggests modifications to an Anchor. Given the computational expense of Simulations, the Agent typically consults with a human expert before generating a Candidate for Simulation. The Agent communicates its reasoning to the human, such as why a specific functional group of atoms should be added to the Anchor.'],
    ['Agent_Human',
        ''],
    ['Human',
        'Humans subscribed to the topic are notified and can interact with the Agent via a web interface. These humans are typically experts on the target disease.'],
    ['Human_Agent',
        ''],
    ['Agent',
        'The Agent incorporates the human feedback, potentially revises its modifications, and decides whether to generate a Candidate for Simulation.'],
    ['Agent_Candidates',
        ''],
    ['Candidates',
        'A Candidate is a proposed drug suggested by the Agent, represented as .pdb files or SMILES strings, similar to Anchors.'],
    ['Candidates_Simulation',
        ''],
    ['Simulation',
        'This stage involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.'],
    ['Simulation_Results',
        ''],
    ['Results',
        'Simulation results, available in various file formats depending on the Simulation tools used, are presented to the Agent for analysis.'],
    ['Results_Agent',
        ''],
    ['Agent',
        'If the results are promising, the Agent decides to draft an academic Paper.'],
    ['Agent_Papers',
        ''],
    ['Papers',
        'A Paper documents the Agent’s reasoning, the Simulation process, and outcomes, offering suggestions for further action or future research.'],
    ['Papers_Human',
        ''],
    ['Human',
        'Humans can retrieve Papers via the web interface and discuss them with the Agent.'],
    ['Human_Agent',
        ''],
    ['Agent',
        'The workflow restarts, either from the beginning or by refining previous iterations.'],
    ['Agent_Agent',
        ''],
];