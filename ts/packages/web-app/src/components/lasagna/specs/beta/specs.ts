import { resourceDescriptions, pathDescriptions } from '../texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '@/components/lasagna/classes';


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
    AgentX: new Resource(new Cell(2 + x, 1 + y, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['Simulation']),
    AgentY: new Resource(new Cell(8 + x, 1 + y, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['Simulation']),
    Anchors: new Resource(new Cell(1 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Anchors']),
    Candidates: new Resource(new Cell(3 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Candidates']),
    Results: new Resource(new Cell(7 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Results']),
    Papers: new Resource(new Cell(9 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Papers']),
    Checkpoints: new Resource(new Cell(5 + x + dataX, 1 + y + dataY, cellWidth, cellHeight), 'lg', 'data', true, resourceDescriptions['Checkpoints']),
} as const;


export const arrowsWithConfig: Record<string, ArrowWithConfig> = {
    Human_Anchors: {
        arrow: new Arrow(['Human', 'left'], ['Anchors', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(0, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Anchors_AgentX'
        }
    },
    Anchors_AgentX: {
        arrow: new Arrow(['Anchors', 'right'], ['AgentX', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(1, 1, cellWidth, cellHeight), 'right'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'AgentX_Candidates'
        }
    },
    AgentX_Candidates: {
        arrow: new Arrow(['AgentX', 'right'], ['Candidates', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 1, cellWidth, cellHeight), 'left'],
            reverse: null,
            // shouldAdjust: true,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Candidates_Simulation'
        }
    },
    Candidates_Simulation: {
        arrow: new Arrow(['Candidates', 'top'], ['Simulation', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Simulation_Results'
        }
    },
    Simulation_Results: {
        arrow: new Arrow(['Simulation', 'right'], ['Results', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(7, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Results_AgentY'
        }
    },
    Results_AgentY: {
        arrow: new Arrow(['Results', 'right'], ['AgentY', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(7, 1, cellWidth, cellHeight), 'right'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'AgentY_Papers'
        }
    },
    AgentY_Papers: {
        arrow: new Arrow(['AgentY', 'right'], ['Papers', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(9, 1, cellWidth, cellHeight), 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Papers_Human'
        }
    },
    Papers_Agent: {
        arrow: new Arrow(['Papers', 'bottom'], ['Agent', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(8, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Papers_Human'
        }
    },
    Papers_Human: {
        arrow: new Arrow(['Papers', 'right'], ['Human', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(10, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Human_Agent'
        }
    },
    Human_Agent: {
        arrow: new Arrow(['Human', 'top'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_Human'
        }
    },
    Agent_Human: {
        arrow: new Arrow(['Agent', 'bottom'], ['Human', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_Checkpoints'
        }
    },
    Agent_Agent: {
        arrow: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_Checkpoints'
        }
    },
    Agent_Checkpoints: {
        arrow: new Arrow(['Agent', 'top'], ['Checkpoints', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Checkpoints_Agent'
        }
    },
    Checkpoints_Agent: {
        arrow: new Arrow(['Checkpoints', 'bottom'], ['Agent', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_AgentX'
        }
    },
    Agent_AgentX: {
        arrow: new Arrow(['Agent', 'left'], ['AgentX', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(2, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_AgentY'
        }
    },
    Agent_AgentY: {
        arrow: new Arrow(['Agent', 'right'], ['AgentY', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(8, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => null
        }
    }
};


export const path: Array<[GraphElementNameType[], string]> = [
    [[],
    pathDescriptions[0]
    ],
    [['Human', 'Human_Anchors', 'Anchors'],
    pathDescriptions[1]
    ],
    [['Anchors', 'Anchors_AgentX', 'AgentX', 'AgentX_Candidates', 'Candidates', 'Agent', 'Agent_AgentX', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    pathDescriptions[2]
    ],
    [['Candidates', 'Candidates_Simulation', 'Simulation', 'Simulation_Results', 'Results'],
    pathDescriptions[3]
    ],
    [['Results', 'Results_Agent', 'Agent', 'Agent_Papers', 'Papers', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    pathDescriptions[4]
    ],
    [['Papers', 'Papers_Human', 'Human'],
    pathDescriptions[5]
    ],
    [['Human', 'Human_Agent', 'Agent', 'Agent_Human', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    pathDescriptions[6]
    ],
    [['Agent', 'Agent_Anchors', 'Papers_Agent', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    pathDescriptions[7]
    ],
];