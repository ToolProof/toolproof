import { resourceDescriptions, pathDescriptions } from '../texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '@/components/lasagna/classes';


export const gridSize = 14;
export const cellWidth = 100;
export const cellHeight = 50;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(6, 7, cellWidth, cellHeight), 'lg', 'code_ai', true, resourceDescriptions['Agent']),
    Assistant: new Resource(new Cell(6, 5, cellWidth, cellHeight), 'gcp', 'code_ai', true, resourceDescriptions['Agent']),
    Human: new Resource(new Cell(6, 9, cellWidth, cellHeight), 'vercel', 'code', true, resourceDescriptions['Human']),
    Tools: new Resource(new Cell(6, 1, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    InternalToolsLeft: new Resource(new Cell(4, 6, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['Tools']),
    InternalToolsRight: new Resource(new Cell(8, 6, cellWidth, cellHeight), 'gcp', 'code_glue', true, resourceDescriptions['Tools']),
    OuterInput: new Resource(new Cell(2, 3, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['OuterInput']),
    InnerInput: new Resource(new Cell(4, 3, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['InnerInput']),
    InnerOutput: new Resource(new Cell(8, 3, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['InnerOutput']),
    OuterOutput: new Resource(new Cell(10, 3, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['OuterOutput']),
    Checkpoints: new Resource(new Cell(6, 3, cellWidth, cellHeight), 'lg', 'data', true, resourceDescriptions['Checkpoints']),
} as const;


export const arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig> = {
    Human_OuterInput: {
        arrow: new Arrow(['Human', 'left'], ['OuterInput', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(1, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'OuterInput_Agent'
        }
    },
    OuterInput_Agent: {
        arrow: new Arrow(['OuterInput', 'bottom'], ['Agent', 'bottomLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 8, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_InnerInput'
        }
    },
    // Won't be drawn in the normal flow
    Agent_OuterInput: {
        arrow: new Arrow(['Agent', 'left'], ['OuterInput', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_InnerInput'
        }
    },
    Agent_InnerInput: {
        arrow: new Arrow(['Agent', 'topLeftD'], ['InnerInput', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(4, 5, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'InnerInput_Tools'
        }
    },
    InnerInput_Tools: {
        arrow: new Arrow(['InnerInput', 'top'], ['Tools', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(4, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Tools_InnerOutput'
        }
    },
    Tools_InnerOutput: {
        arrow: new Arrow(['Tools', 'right'], ['InnerOutput', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(8, 1, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'InnerOutput_Agent'
        }
    },
    InnerOutput_Agent: {
        arrow: new Arrow(['InnerOutput', 'bottom'], ['Agent', 'topRightD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(8, 5, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_OuterOutput'
        }
    },
    Agent_OuterOutput: {
        arrow: new Arrow(['Agent', 'bottomRightD'], ['OuterOutput', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(9, 8, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'OuterOutput_Human'
        }
    },
    // Won't be drawn in the normal flow
    OuterOutput_Agent: {
        arrow: new Arrow(['OuterOutput', 'bottom'], ['Agent', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(9, 5, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'OuterOutput_Human'
        }
    },
    OuterOutput_Human: {
        arrow: new Arrow(['OuterOutput', 'right'], ['Human', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(11, 7, cellWidth, cellHeight), 'bottom'],
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
            next: (bar: () => boolean) => {
                if (bar()) {
                    return 'Agent_Assistant';
                } else {
                    return 'Agent_Checkpoints';
                }
            }
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
            next: (bar: () => boolean) => 'Agent_InternalToolsLeft'
        }
    },
    Agent_Assistant: {
        arrow: new Arrow(['Agent', 'top'], ['Assistant', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Assistant_Agent'
        }
    },
    Assistant_Agent: {
        arrow: new Arrow(['Assistant', 'bottom'], ['Agent', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Assistant_Checkpoints'
        }
    },
    Assistant_Checkpoints: {
        arrow: new Arrow(['Assistant', 'top'], ['Checkpoints', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Checkpoints_Assistant'
        }
    },
    Checkpoints_Assistant: {
        arrow: new Arrow(['Checkpoints', 'bottom'], ['Assistant', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_InternalToolsLeft'
        }
    },
    Agent_InternalToolsLeft: {
        arrow: new Arrow(['Agent', 'left'], ['InternalToolsLeft', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'InternalToolsLeft_Agent'
        }
    },
    InternalToolsLeft_Agent: {
        arrow: new Arrow(['InternalToolsLeft', 'right'], ['Agent', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_InternalToolsRight'
        }
    },
    Agent_InternalToolsRight: {
        arrow: new Arrow(['Agent', 'right'], ['InternalToolsRight', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'InternalToolsRight_Agent'
        }
    },
    InternalToolsRight_Agent: {
        arrow: new Arrow(['InternalToolsRight', 'left'], ['Agent', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => null
        }
    },
    // Won't be drawn in the normal flow
    Agent_Agent: {
        arrow: new Arrow(['Agent', 'bottom'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => null
        }
    },
};


export const path: Array<[GraphElementNameType[], string]> = [
    [[],
    pathDescriptions[0]
    ],
    [['Human', 'Human_OuterInput', 'OuterInput'],
    pathDescriptions[1]
    ],
    [['OuterInput', 'OuterInput_Agent', 'Agent', 'Agent_InnerInput', 'InnerInput', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent', 'Agent_Assistant', 'Assistant_Agent', 'Assistant', 'Assistant_Checkpoints', 'Checkpoints_Assistant', 'Agent_InternalToolsLeft', 'InternalToolsLeft', 'InternalToolsLeft_Agent', 'Agent_Human', 'Human', 'Human_Agent'],
    pathDescriptions[2]
    ],
    [['InnerInput', 'InnerInput_Tools', 'Tools', 'Tools_InnerOutput', 'InnerOutput'],
    pathDescriptions[3]
    ],
    [['InnerOutput', 'InnerOutput_Agent', 'Agent', 'Agent_OuterOutput', 'OuterOutput', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent', 'Agent_Assistant', 'Assistant_Agent', 'Assistant', 'Assistant_Checkpoints', 'Checkpoints_Assistant', 'Checkpoints_Assistant', 'Agent_InternalToolsRight', 'InternalToolsRight', 'InternalToolsRight_Agent', 'Agent_Human', 'Human', 'Human_Agent'],
    pathDescriptions[4]
    ],
    [['OuterOutput', 'OuterOutput_Human', 'Human'],
    pathDescriptions[5]
    ],
    /* [['Human', 'Human_Agent', 'Agent', 'Agent_Human', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent', 'Agent_Assistant', 'Assistant_Agent', 'Assistant', 'Assistant_Checkpoints'],
    pathDescriptions[6]
    ], */
    /* [['Agent', 'Agent_OuterInput', 'OuterOutput_Agent', 'Agent_Checkpoints', 'Checkpoints', 'Checkpoints_Agent'],
    pathDescriptions[7]
    ], */
];



