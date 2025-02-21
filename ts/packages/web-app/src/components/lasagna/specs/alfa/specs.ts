import { resourceDescriptions, sequenceDescriptions } from './texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '../../types';


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
    Agent: new Resource(new Cell(5 + x, 5 + y, cellWidth, cellHeight), 'lg', 'code', true, resourceDescriptions['Agent']),
    Human: new Resource(new Cell(5 + x, 7 + y, cellWidth, cellHeight), 'vercel', 'code', true, resourceDescriptions['Human']),
    Simulation: new Resource(new Cell(5 + x, 1 + y, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Simulation']),
    Anchors: new Resource(new Cell(1 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Anchors']),
    AnchorsGlue: new Resource(new Cell(1 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['AnchorsGlue']),
    Candidates: new Resource(new Cell(3 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Candidates']),
    CandidatesGlue: new Resource(new Cell(3 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['CandidatesGlue']),
    Results: new Resource(new Cell(7 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Results']),
    ResultsGlue: new Resource(new Cell(7 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['ResultsGlue']),
    Papers: new Resource(new Cell(9 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Papers']),
    PapersGlue: new Resource(new Cell(9 + x + glueX, 2 + y + glueY, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['PapersGlue']),
    Checkpoints: new Resource(new Cell(5 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'lg', 'data', true, resourceDescriptions['Checkpoints']),
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
    sequenceDescriptions[0]
    ],
    [['Human', 'Human_Anchors', 'Anchors'],
    sequenceDescriptions[1]
    ],
    [['Anchors', 'Anchors_Agent', 'Agent', 'Agent_Candidates', 'Candidates', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    sequenceDescriptions[2]
    ],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
    sequenceDescriptions[3]
    ],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    sequenceDescriptions[4]
    ],
    [['Papers', 'Papers_Human', 'Human'],
    sequenceDescriptions[5]
    ],
    [['Human', 'Human_Agent', 'Agent', 'Agent_Human', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    sequenceDescriptions[6]
    ],
    [['Agent', 'Agent_Anchors', 'Papers_Agent', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    sequenceDescriptions[7]
    ],
];



