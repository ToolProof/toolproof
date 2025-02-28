import { nodeDescriptions, pathDescriptions } from '../texts';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, GraphElementNameType, EdgeWithConfig } from '@/components/lasagna/classes';


export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        AI: new Node(new Cell(2, 4, cellWidth, cellHeight), 'lg', 'code_ai', true, nodeDescriptions['AI']),
        Humans: new Node(new Cell(2, 7, cellWidth, cellHeight), 'vercel', 'code', true, nodeDescriptions['Humans']),
        Tools: new Node(new Cell(2, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Data: new Node(new Cell(0, 4, cellWidth, cellHeight), 'gcp', 'data', true, nodeDescriptions['Tools']),
    } as const;
}


export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        AI_Tools: {
            edge: new Edge(['AI', 'top'], ['Tools', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tools_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_AI'
            }
        },
        Tools_AI: {
            edge: new Edge(['Tools', 'bottom'], ['AI', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_AI'
            }
        },
        Humans_AI: {
            edge: new Edge(['Humans', 'top'], ['AI', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_Humans'
            }
        },
        AI_Humans: {
            edge: new Edge(['AI', 'bottom'], ['Humans', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Humans_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_Humans'
            }
        },
        Tools_Humans: {
            edge: new Edge(['Tools', 'right'], ['Humans', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(3, 4, cellWidth, cellHeight), 'right'],
                reverse: 'Humans_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_Tools'
            }
        },
        Humans_Tools: {
            edge: new Edge(['Humans', 'right'], ['Tools', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(3, 4, cellWidth, cellHeight), 'right'],
                reverse: 'Tools_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Data_AI'
            }
        },
        Data_AI: {
            edge: new Edge(['Data', 'right'], ['AI', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_Data',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_Data'
            }
        },
        AI_Data: {
            edge: new Edge(['AI', 'left'], ['Data', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Data_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Data_Tools'
            }
        },
        Data_Tools: {
            edge: new Edge(['Data', 'top'], ['Tools', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 2, cellWidth, cellHeight), 'left'],
                reverse: 'Tools_Data',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_Data'
            }
        },
        Tools_Data: {
            edge: new Edge(['Tools', 'left'], ['Data', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 2, cellWidth, cellHeight), 'left'],
                reverse: 'Data_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Data_Humans'
            }
        },
        Data_Humans: {
            edge: new Edge(['Data', 'bottom'], ['Humans', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 6, cellWidth, cellHeight), 'left'],
                reverse: 'Humans_Data',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_Data'
            }
        },
        Humans_Data: {
            edge: new Edge(['Humans', 'left'], ['Data', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 6, cellWidth, cellHeight), 'left'],
                reverse: 'Data_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}

export const validTransitions: Record<GraphElementNameType, GraphElementNameType[]> = {
    AI: ['AI_Tools', 'AI_Humans', 'AI_Data'],
    Tools: ['Tools_AI', 'Tools_Humans', 'Tools_Data'],
    Humans: ['Humans_AI', 'Humans_Tools', 'Humans_Data'],
    Data: ['Data_AI', 'Data_Tools', 'Data_Humans'],
    AI_Tools: ['Tools'],
    Tools_AI: ['AI'],
    AI_Humans: ['Humans'],
    Humans_AI: ['AI'],
    Tools_Humans: ['Humans'],
    Humans_Tools: ['Tools'],
    Tools_Data: ['Data'],
    Data_Tools: ['Tools'],
    AI_Data: ['Data'],
    Data_AI: ['AI'],
    Humans_Data: ['Data'],
    Data_Humans: ['Humans'],
};

export const pathOfGenesis: Array<[GraphElementNameType[], string]> = [
    [['Humans'],
        'In the beginning, there were only humans.'
    ],
    [['Humans', 'Humans_Tools', 'Tools'],
        'Then Humans made Tools.'
    ],
    /* [['Humans', 'Tools_Humans', 'Tools'],
        'Humans were using the Tools. They could create more Humans.'
    ],
    [['Humans', 'Humans_Tools', 'Tools'],
        'Then Humans made more advanced Tools.'
    ],
    [['Humans', 'Tools_Humans', 'Tools'],
        'Then Humans were using these more advanced Tools. They could create even more Humans.'
    ], */
    [['Humans', 'Humans_Tools', 'Tools', 'Tools_Data', 'Data'],
        'Then Humans made Tools that could store Data. We entered the Historical Period. We had books, later usepapers'
    ],
    /* [['Humans', 'Humans_Tools', 'Tools', 'Tools_Data', 'Data', 'Data_Humans'],
        'Humans were consuming the Data that either themselves or other Humans had generated.'
    ], */
    [['Humans', 'Humans_Data', 'Data', 'Data_Tools', 'Tools'],
        'Humans put Data into Tools. We had computers.'
    ],
    [['Humans', 'Humans_Data', 'Data', 'Data_Tools', 'Tools'],
        'One trick. Humans could now primarily use computers to interact with the world.'
    ],
    [['Humans', 'Humans_Data', 'Data', 'Data_Tools', 'Tools', 'AI'],
        'Humans put Data into Tools. We had computers.'
    ],
];




