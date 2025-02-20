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
    Agent: new Resource(new Cell(5 + x, 5 + y, cellWidth, cellHeight), 'lg', 'code', true,
        'Built around a powerful, reflective GPT-style LLM, such as OpenAI\'s o3, the Agent is pre-configured to use its parametric capabilities to collaborate with humans and tools for drug discovery focused on a specified disease.'),
    Human: new Resource(new Cell(5 + x, 7 + y, cellWidth, cellHeight), 'vercel', 'code', true,
        'Humans interact with the process via a web interface. A human in the loop will typically be an expert on the target disease.'),
    Simulation: new Resource(new Cell(5 + x, 1 + y, cellWidth, cellHeight), 'gcp', 'code', true,
        'Simulation involves specialized tools that support the drug discovery process through molecular docking, molecular dynamics, quantum mechanical free energy calculations, and more. These tools, often Python-based (e.g., AutoDock Vina, Schrödinger Suite), stress-test the Candidate’s ability to bind to target molecules, usually proteins.'),
    Anchors: new Resource(new Cell(1 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true,
        'Anchors serve as starting points for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'),
    AnchorsGlue: new Resource(new Cell(1 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true,
        'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage'),
    Candidates: new Resource(new Cell(3 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true,
        'Candidates are drugs that the Agent suggests. Candidates are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.'),
    CandidatesGlue: new Resource(new Cell(3 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true,
        'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage'),
    Results: new Resource(new Cell(7 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true,
        'Simulation results, which include files in various formats depending on the simulation tools used.'),
    ResultsGlue: new Resource(new Cell(7 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true,
        'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage'),
    Papers: new Resource(new Cell(9 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true,
        'Actionable academic papers that document the Agent\'s reasoning behind crafting the Candidate, the simulation process, and the results, offering suggestions for further action or future research (e.g. lab experiments).'),
    PapersGlue: new Resource(new Cell(9 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true,
        'Glue, as indicated by the small squares, means that LangGraph Platform needs an intermediate layer (for example GCP Cloud Run services) to talk to GCP Cloud Storage'),
    Checkpoints: new Resource(new Cell(5 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'lg', 'data', true,
        'Checkpoints record the agent\'s internal state and serves as a detailed log of every step it takes, allowing it to introspect its own behavior.'),
} as const;


export const arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig> = {
    Human_Anchors: {
        arrow: new Arrow(['Human', 'left'], ['Anchors', 'left'], resources),
        config: {
            controlPoint: [new Cell(0, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => {
                if (z === 7) {
                    return 'Agent_Anchors';
                } else {
                    return 'Anchors_Agent';
                }
            }
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
            next: (z: number) => 'Agent_Candidates'
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
        arrow: new Arrow(['Agent', 'left'], ['Candidates', 'bottom'], resources),
        config: {
            controlPoint: [new Cell(3, 5, cellWidth, cellHeight), 'top'],
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
        arrow: new Arrow(['Results', 'bottom'], ['Agent', 'right'], resources),
        config: {
            controlPoint: [new Cell(7, 5, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (z: number) => {
                if (z === 7) {
                    return 'Papers_Agent';
                } else {
                    return 'Agent_Papers';
                }
            }
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
    Papers_Agent: {
        arrow: new Arrow(['Papers', 'bottom'], ['Agent', 'right'], resources),
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
        'Click on a Resource (rectangle or ellipse) to learn more about it, or use the bottom panel to navigate through a typical process iteration.',
    ],
    [['Human', 'Human_Anchors', 'Anchors'],
        'A Human uploads an Anchor.'],
    [['Anchors', 'Anchors_Agent', 'Agent', 'Agent_Candidates', 'Candidates', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'The Agent retrieves the Anchor and generates a Candidate.'],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
        'The Simulation tool retrieves the Candidate and generates Results.'],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'The Agent retrieves the Results. If they are promising, it decides to draft a Paper.'],
    [['Papers', 'Papers_Human', 'Human'],
        'The Human retrieves the Paper to read it.'],
    [['Human', 'Human_Agent', 'Agent', 'Agent_Human', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'The Human and the Agent discuss the Paper.'],
    [['Agent', 'Agent_Anchors', 'Papers_Agent', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
        'In addition: the Agent can retrieve Papers and generate Anchors for new iterations.'],
];