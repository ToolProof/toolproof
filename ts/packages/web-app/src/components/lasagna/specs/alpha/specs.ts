import { resourceDescriptions, pathDescriptions } from '../texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '@/components/lasagna/classes';


export const gridSize = 14;
export const cellWidth = 100;
export const cellHeight = 50;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(6, 5, cellWidth, cellHeight), 'lg', 'code_ai', true, resourceDescriptions['Agent']),
    Assistant: new Resource(new Cell(6, 7, cellWidth, cellHeight), 'gcp', 'code_ai', true, resourceDescriptions['Agent']),
    Human: new Resource(new Cell(6, 9, cellWidth, cellHeight), 'vercel', 'code', true, resourceDescriptions['Human']),
    Tools: new Resource(new Cell(6, 3, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Input: new Resource(new Cell(3, 5, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Input']),
    Output: new Resource(new Cell(9, 5, cellWidth, cellHeight), 'gcp', 'data', true, resourceDescriptions['Output']),
    Checkpoints: new Resource(new Cell(9, 5, cellWidth, cellHeight), 'lg', 'data_meta', true, resourceDescriptions['Output']),
    DummyRight: new Resource(new Cell(9, 2, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    DummyLeft: new Resource(new Cell(3, 2, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
} as const;


export const arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig> = {
    Human_Input: {
        arrow: new Arrow(['Human', 'left'], ['Input', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Input_Agent'
        }
    },
    Input_Agent: {
        arrow: new Arrow(['Input', 'right'], ['Agent', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => {
                if (bar()) { // ATTENTION
                    return 'Agent_Output'
                } else {
                    return 'Agent_Output';
                }
            }
        }
    },
    Agent_Output: {
        arrow: new Arrow(['Agent', 'right'], ['Output', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Output_Human'
        }
    },
    Agent_Checkpoints: {
        arrow: new Arrow(['Agent', 'right'], ['Checkpoints', 'center'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Output_Human'
        }
    },
    Output_Human: {
        arrow: new Arrow(['Output', 'bottom'], ['Human', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(9, 7, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_Tools'
        }
    },
    Agent_Tools: {
        arrow: new Arrow(['Agent', 'top'], ['Tools', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Tools_Agent'
        }
    },
    Tools_Agent: {
        arrow: new Arrow(['Tools', 'bottom'], ['Agent', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Input_Tools'
        }
    },
    Input_Tools: {
        arrow: new Arrow(['Input', 'top'], ['Tools', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(3, 3, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Tools_Output'
        }
    },
    Tools_Output: {
        arrow: new Arrow(['Tools', 'right'], ['Output', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(9, 3, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Output_DummyRight'
        }
    },
    Output_DummyRight: {
        arrow: new Arrow(['Output', 'right'], ['DummyRight', 'right'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(11, 3, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'DummyRight_DummyLeft'
        }
    },
    DummyRight_DummyLeft: {
        arrow: new Arrow(['DummyRight', 'right'], ['DummyLeft', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'DummyLeft_Input'
        }
    },
    DummyLeft_Input: {
        arrow: new Arrow(['DummyLeft', 'left'], ['Input', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(1, 3, cellWidth, cellHeight), 'top'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => {
                if (bar()) {
                    return 'Agent_Assistant'
                } else {
                    return 'Human_Agent';
                }
            }
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
            next: (bar: () => boolean) => null
        }
    },
    Agent_Assistant: {
        arrow: new Arrow(['Agent', 'bottom'], ['Assistant', 'top'], resources, cellWidth, cellHeight),
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
        arrow: new Arrow(['Assistant', 'top'], ['Agent', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Human_Assistant'
        }
    },
    Human_Assistant: {
        arrow: new Arrow(['Human', 'top'], ['Assistant', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Assistant_Human'
        }
    },
    Assistant_Human: {
        arrow: new Arrow(['Assistant', 'bottom'], ['Human', 'top'], resources, cellWidth, cellHeight),
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
        arrow: new Arrow(['Assistant', 'right'], ['Checkpoints', 'bottomLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: [new Cell(8, 6, cellWidth, cellHeight), 'bottom'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => null
        }
    },
};


const Human_Input: GraphElementNameType[] = ['Human', 'Human_Input', 'Input'];
const Input_Output_Agent_Tools: GraphElementNameType[] = ['Input', 'Input_Agent', 'Agent', 'Agent_Output', 'Output', 'Checkpoints', 'Agent_Tools', 'Tools', 'Tools_Agent', 'Agent_Assistant', 'Assistant', 'Assistant_Agent', 'Assistant_Checkpoints'];
const Output_Input: GraphElementNameType[] = ['Output', 'Output_DummyRight', 'DummyRight', 'DummyRight_DummyLeft', 'DummyLeft', 'DummyLeft_Input', 'Input']
const Input_Output_Tools: GraphElementNameType[] = ['Input', 'Input_Tools', 'Tools', 'Tools_Output', 'Output']
const Output_Human: GraphElementNameType[] = ['Output', 'Output_Human', 'Human']

export const path: Array<[GraphElementNameType[], string]> = [
    [[],
    pathDescriptions[0]
    ],
    [Human_Input,
        pathDescriptions[1]
    ],
    [Input_Output_Agent_Tools,
        pathDescriptions[2]
    ],
    [Output_Input,
        pathDescriptions[3]
    ],
    [Input_Output_Tools,
        pathDescriptions[4]
    ],
    [Output_Input,
        pathDescriptions[5]
    ],
    [Input_Output_Agent_Tools,
        pathDescriptions[6]
    ],
    [Output_Human,
        pathDescriptions[7]
    ],
];




