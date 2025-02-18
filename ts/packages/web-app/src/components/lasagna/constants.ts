import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType } from './types';


export const gridSize = 12;
export const cellWidth = 120;
export const cellHeight = 60;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(5, 5, cellWidth, cellHeight), 'lg', 'code', true),
    Human: new Resource(new Cell(5, 7, cellWidth, cellHeight), 'vercel', 'code', true),
    Simulation: new Resource(new Cell(5, 3, cellWidth, cellHeight), 'gcp', 'code', true),
    Anchors: new Resource(new Cell(2, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    AnchorsGlue: new Resource(new Cell(2, 2, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Candidates: new Resource(new Cell(4, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    CandidatesGlue: new Resource(new Cell(4, 2, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Results: new Resource(new Cell(6, 1, cellWidth, cellHeight), 'gcp', 'data', false),
    ResultsGlue: new Resource(new Cell(6, 2, cellWidth, cellHeight), 'gcp', 'code_glue', false),
    Papers: new Resource(new Cell(8, 1, cellWidth, cellHeight), 'gcp', 'data', true),
    PapersGlue: new Resource(new Cell(8, 2, cellWidth, cellHeight), 'gcp', 'code_glue', true),
} as const;


export const arrows: Record<ArrowNameType, Arrow> = {
    Human_Anchors: new Arrow(['Human', 'left'], ['Anchors', 'left'], resources, cellWidth, cellHeight),
    Agent_Anchors: new Arrow(['Agent', 'left'], ['Anchors', 'bottom'], resources, cellWidth, cellHeight),
    Anchors_Agent: new Arrow(['Anchors', 'bottom'], ['Agent', 'left'], resources, cellWidth, cellHeight),
    Agent_Candidates: new Arrow(['Agent', 'top'], ['Candidates', 'bottom'], resources, cellWidth, cellHeight),
    Candidates_Simulation: new Arrow(['Candidates', 'right'], ['Simulation', 'top'], resources, cellWidth, cellHeight),
    Simulation_Results: new Arrow(['Simulation', 'top'], ['Results', 'left'], resources, cellWidth, cellHeight),
    Results_Agent: new Arrow(['Results', 'bottom'], ['Agent', 'top'], resources, cellWidth, cellHeight),
    Agent_Papers: new Arrow(['Agent', 'right'], ['Papers', 'bottom'], resources, cellWidth, cellHeight),
    Agent_Human: new Arrow(['Agent', 'bottom'], ['Human', 'top'], resources, cellWidth, cellHeight),
    Human_Agent: new Arrow(['Human', 'top'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
    Papers_Human: new Arrow(['Papers', 'right'], ['Human', 'right'], resources, cellWidth, cellHeight),
    Agent_Agent: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
};


export const sequence: Array<[GraphElementNameType[], string]> = [
    [[],
        'Welcome to a visualization of ToolProof Drug Discovery! The Agent is pre-configured to collaborate with humans and tools for drug discovery focused on a specified disease.',
    ],
    [['Human', 'Human_Anchors', 'Anchors'],
        'Humans interact with the process via a web interface. Humans can upload Anchors, which serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'],
    [['Anchors', 'Anchors_Agent', 'Agent', 'Agent_Candidates', 'Candidates'],
        'The Agent retrieves one or more Anchors. Built around a highly capable, reflective GPT-style LLM, such as OpenAI\'s o3, it leverages its parametric knowledge to suggest modifications to an Anchor and generate a Candidate—a drug potentially better suited to treat the disease. Like Anchors, Candidates are represented as .pdb files or SMILES strings.'],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
        'This stage involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.'],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers'],
        'Simulation results, available in various file formats depending on the simulation tools used, are presented to the Agent. If the results are promising, the Agent decides to draft an academic paper to document its reasoning behind crafting the Candidate, the simulation process, and the results, offering suggestions for further action or future research.'],
    [['Papers', 'Papers_Human', 'Human'],
        'Humans can retrieve papers via the web interface.'],
    [['Human', 'Human_Agent', 'Agent', 'Agent_Human'],
        'Humans and the Agent can talk about anything related to the drug discovery process. Although shown here as a seperate stage, this interaction can happen at any time and be initiated by either party. A human might for example want to discuss a paper, or the Agent might request to interview a human expert.'],
];

