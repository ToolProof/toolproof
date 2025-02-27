import { resourceDescriptions, pathDescriptions } from '../texts';
import { Cell, ResourceNameType, ArrowNameType, Resource, Arrow, GraphElementNameType, ArrowWithConfig } from '@/components/lasagna/classes';


export const gridSize = 14;
export const cellWidth = 100;
export const cellHeight = 50;


export const resources: Record<ResourceNameType, Resource> = {
    AI: new Resource(new Cell(10, 5, cellWidth, cellHeight), 'lg', 'code_ai', true, resourceDescriptions['AI']),
    Humans: new Resource(new Cell(10, 8, cellWidth, cellHeight), 'vercel', 'code', true, resourceDescriptions['Humans']),
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
    AI_Tools: {
        arrow: new Arrow(['AI', 'top'], ['Tools', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Tools_AI'
        }
    },
    Tools_AI: {
        arrow: new Arrow(['Tools', 'bottom'], ['AI', 'top'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Humans_AI'
        }
    },
    Humans_AI: {
        arrow: new Arrow(['Humans', 'top'], ['AI', 'bottom'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'AI_Humans'
        }
    },
    AI_Humans: {
        arrow: new Arrow(['AI', 'bottom'], ['Humans', 'top'], resources, cellWidth, cellHeight),
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
            next: (bar: () => boolean) => 'Dummy5_AI'
        }
    },
    Dummy5_AI: {
        arrow: new Arrow(['Dummy5', 'center'], ['AI', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'AI_Dummy5'
        }
    },
    AI_Dummy5: {
        arrow: new Arrow(['AI', 'left'], ['Dummy5', 'center'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Dummy8_Humans'
        }
    },
    Dummy8_Humans: {
        arrow: new Arrow(['Dummy8', 'center'], ['Humans', 'left'], resources, cellWidth, cellHeight),
        config: {
            controlPoint: null,
            reverse: null,
            drawInOrder: (foo, key, arrowWithConfig) => {
                foo(key, arrowWithConfig);
            },
            next: (bar: () => boolean) => 'Humans_Dummy8'
        }
    },
    Humans_Dummy8: {
        arrow: new Arrow(['Humans', 'left'], ['Dummy8', 'center'], resources, cellWidth, cellHeight),
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


const Humans_Input: GraphElementNameType[] = ['Humans'];
const Input_Output_AI_Tools: GraphElementNameType[] = ['AI'];

export const path: Array<[GraphElementNameType[], string]> = [
    [[],
    pathDescriptions[0]
    ],
    [Humans_Input,
        pathDescriptions[1]
    ],
];




