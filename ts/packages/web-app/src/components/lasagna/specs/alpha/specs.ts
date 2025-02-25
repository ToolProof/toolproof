import { resourceDescriptions, pathDescriptions } from '../texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '@/components/lasagna/classes';


export const gridSize = 14;
export const cellWidth = 100;
export const cellHeight = 50;


export const resources: Record<ResourceNameType, Resource> = {
    Agent: new Resource(new Cell(10, 5, cellWidth, cellHeight), 'lg', 'code_ai', true, resourceDescriptions['Agent']),
    Human: new Resource(new Cell(10, 8, cellWidth, cellHeight), 'vercel', 'code', true, resourceDescriptions['Human']),
    Tools: new Resource(new Cell(10, 2, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy0: new Resource(new Cell(7, 0, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy2: new Resource(new Cell(7, 2, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy2B: new Resource(new Cell(8, 2, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy5: new Resource(new Cell(7, 5, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy5B: new Resource(new Cell(8, 5, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy8: new Resource(new Cell(7, 8, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy8B: new Resource(new Cell(8, 8, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
    Dummy10: new Resource(new Cell(7, 10, cellWidth, cellHeight), 'gcp', 'code', true, resourceDescriptions['Tools']),
} as const;


export const arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig> = {
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
            next: (bar: () => boolean) => 'Dummy0_Dummy2'
        }
    },
    Dummy0_Dummy2: {
        arrow: new Arrow(['Dummy0', 'topRight'], ['Dummy2', 'topRight'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy2_Dummy2BA'
        }
    },
    Dummy2_Dummy2BA: {
        arrow: new Arrow(['Dummy2', 'topRight'], ['Dummy2B', 'topLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy2B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy2_Dummy2BB'
        }
    },
    Dummy2_Dummy2BB: {
        arrow: new Arrow(['Dummy2', 'bottomRight'], ['Dummy2B', 'bottomLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy2B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy2_Dummy5'
        }
    },
    Dummy2_Dummy5: {
        arrow: new Arrow(['Dummy2', 'bottomRight'], ['Dummy5', 'topRight'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy5_Dummy5BA'
        }
    },
    Dummy5_Dummy5BA: {
        arrow: new Arrow(['Dummy5', 'topRight'], ['Dummy5B', 'topLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy5B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy5_Dummy5BB'
        }
    },
    Dummy5_Dummy5BB: {
        arrow: new Arrow(['Dummy5', 'bottomRight'], ['Dummy5B', 'bottomLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy5B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy5_Dummy8'
        }
    },
    Dummy5_Dummy8: {
        arrow: new Arrow(['Dummy5', 'bottomRight'], ['Dummy8', 'topRight'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy8_Dummy8BA'
        }
    },
    Dummy8_Dummy8BA: {
        arrow: new Arrow(['Dummy8', 'topRight'], ['Dummy8B', 'topLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy8B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy8_Dummy8BB'
        }
    },
    Dummy8_Dummy8BB: {
        arrow: new Arrow(['Dummy8', 'bottomRight'], ['Dummy8B', 'bottomLeftD'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: ['Dummy8B', 'left'],
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy8_Dummy10'
        }
    },
    Dummy8_Dummy10: {
        arrow: new Arrow(['Dummy8', 'bottomRight'], ['Dummy10', 'bottomRight'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy2_Tools'
        }
    },
    Dummy2_Tools: {
        arrow: new Arrow(['Dummy2', 'center'], ['Tools', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Tools_Dummy2'
        }
    },
    Tools_Dummy2: {
        arrow: new Arrow(['Tools', 'left'], ['Dummy2', 'center'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy5_Agent'
        }
    },
    Dummy5_Agent: {
        arrow: new Arrow(['Dummy5', 'center'], ['Agent', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Agent_Dummy5'
        }
    },
    Agent_Dummy5: {
        arrow: new Arrow(['Agent', 'left'], ['Dummy5', 'center'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy8_Human'
        }
    },
    Dummy8_Human: {
        arrow: new Arrow(['Dummy8', 'center'], ['Human', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Human_Dummy8'
        }
    },
    Human_Dummy8: {
        arrow: new Arrow(['Human', 'left'], ['Dummy8', 'center'], resources, cellWidth, cellHeight),
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


const Human_Input: GraphElementNameType[] = ['Human'];
const Input_Output_Agent_Tools: GraphElementNameType[] = ['Agent'];

export const path: Array<[GraphElementNameType[], string]> = [
    [[],
    pathDescriptions[0]
    ],
    [Human_Input,
        pathDescriptions[1]
    ],
];




