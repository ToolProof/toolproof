import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from './types';


export const gridSize = 12;
export const cellWidth = 120;
export const cellHeight = 60;

const x = 0;
const y = 0;
const dataX = 0;
const dataY = 2;
const glueX = 0;
const glueY = 2;

export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(5 + x, 5 + y, cellWidth, cellHeight), 'lg', 'code', true),
    Human: new Resource(new Cell(5 + x, 7 + y, cellWidth, cellHeight), 'vercel', 'code', true),
    Simulation: new Resource(new Cell(5 + x, 1 + y, cellWidth, cellHeight), 'gcp', 'code', true),
    Anchors: new Resource(new Cell(1 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true),
    AnchorsGlue: new Resource(new Cell(1 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Candidates: new Resource(new Cell(3 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true),
    CandidatesGlue: new Resource(new Cell(3 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Results: new Resource(new Cell(7 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true),
    ResultsGlue: new Resource(new Cell(7 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Papers: new Resource(new Cell(9 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true),
    PapersGlue: new Resource(new Cell(9 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true),
    Checkpoints: new Resource(new Cell(5 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'lg', 'data', true),
} as const;


export const arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig> = {
    Human_Anchors: {
        arrow: new Arrow(['Human', 'left'], ['Anchors', 'left'], resources),
        config: {
            controlPoint: [new Cell(0, 7, cellWidth, cellHeight), 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
                return () => 'AgentAnchors';
            },
            next: (z: number) => 'Agent_Anchors'
        }
    },
    Agent_Anchors: {
        arrow: new Arrow(['Agent', 'left'], ['Anchors', 'bottom'], resources),
        config: {
            controlPoint: [new Cell(2, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Anchors_Agent'
        }
    },
    Anchors_Agent: {
        arrow: new Arrow(['Anchors', 'bottom'], ['Agent', 'left'], resources),
        config: {
            controlPoint: [new Cell(2, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            // shouldAdjust: true,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Agent_Candidates'
        }
    },
    Agent_Candidates: {
        arrow: new Arrow(['Agent', 'top'], ['Candidates', 'bottom'], resources),
        config: {
            controlPoint: [new Cell(4, 4, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Candidates_Simulation'
        }
    },
    Candidates_Simulation: {
        arrow: new Arrow(['Candidates', 'top'], ['Simulation', 'left'], resources),
        config: {
            controlPoint: [new Cell(3, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Simulation_Results'
        }
    },
    Simulation_Results: {
        arrow: new Arrow(['Simulation', 'right'], ['Results', 'top'], resources),
        config: {
            controlPoint: [new Cell(7, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Results_Agent'
        }
    },
    Results_Agent: {
        arrow: new Arrow(['Results', 'bottom'], ['Agent', 'top'], resources),
        config: {
            controlPoint: [new Cell(6, 4, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Agent_Papers'
        }
    },
    Agent_Papers: {
        arrow: new Arrow(['Agent', 'right'], ['Papers', 'bottom'], resources),
        config: {
            controlPoint: [new Cell(8, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Papers_Human'
        }
    },
    Papers_Human: {
        arrow: new Arrow(['Papers', 'right'], ['Human', 'right'], resources),
        config: {
            controlPoint: [new Cell(10, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Human_Agent'
        }
    },
    Human_Agent: {
        arrow: new Arrow(['Human', 'top'], ['Agent', 'bottom'], resources),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Agent_Human'
        }
    },
    Agent_Human: {
        arrow: new Arrow(['Agent', 'bottom'], ['Human', 'top'], resources),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Agent_Checkpoints'
        }
    },
    Agent_Agent: {
        arrow: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Agent_Checkpoints'
        }
    },
    Agent_Checkpoints: {
        arrow: new Arrow(['Agent', 'top'], ['Checkpoints', 'bottom'], resources),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => 'Checkpoints_Agent'
        }
    },
    Checkpoints_Agent: {
        arrow: new Arrow(['Checkpoints', 'bottom'], ['Agent', 'top'], resources),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => null
        }
    }
};


export const sequence: Array<[GraphElementNameType[], string]> = [
    [[],
        'Welcome to a visualization of ToolProof Drug Discovery! The Agent is pre-configured to collaborate with humans and tools for drug discovery focused on a specified disease.',
    ],
    [['Human', 'Human_Anchors', 'Anchors'],
        'Humans interact with the process via a web interface. Humans can upload Anchors, which serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'],
    [['Anchors', 'Anchors_Agent', 'Agent_Anchors', 'Agent', 'Agent_Candidates', 'Candidates', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'The Agent retrieves one or more Anchors. Built around a highly capable, reflective GPT-style LLM, such as OpenAI\'s o3, it leverages its parametric knowledge to suggest modifications to an Anchor and generate a Candidate—a drug potentially better suited to treat the disease. Like Anchors, Candidates are represented as .pdb files or SMILES strings.'],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
        'This stage involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.'],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'Simulation results, available in various file formats depending on the simulation tools used, are presented to the Agent. If the results are promising, the Agent decides to draft an academic paper to document its reasoning behind crafting the Candidate, the simulation process, and the results, offering suggestions for further action or future research.'],
    [['Papers', 'Papers_Human', 'Human'],
        'Humans can retrieve papers via the web interface.'],
    [['Human', 'Human_Agent', 'Agent', 'Agent_Human', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'Humans and the Agent can talk about anything related to the drug discovery process. Although shown here as a seperate stage, this interaction can happen at any time and be initiated by either party. A human might for example want to discuss a paper, or the Agent might request to interview a human expert.'],
];

