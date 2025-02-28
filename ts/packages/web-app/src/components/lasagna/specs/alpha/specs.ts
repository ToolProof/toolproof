import { nodeDescriptions, pathDescriptions } from '../texts';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, GraphElementNameType, EdgeWithConfig } from '@/components/lasagna/classes';


export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        AI: new Node(new Cell(2, 4, cellWidth, cellHeight), 'lg', 'code_ai', true, nodeDescriptions['AI']),
        Humans: new Node(new Cell(2, 7, cellWidth, cellHeight), 'vercel', 'code', true, nodeDescriptions['Humans']),
        Tools: new Node(new Cell(2, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy0: new Node(new Cell(0, 0, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy2: new Node(new Cell(0, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy2B: new Node(new Cell(1, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy5: new Node(new Cell(0, 4, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy5B: new Node(new Cell(1, 4, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy8: new Node(new Cell(0, 7, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy8B: new Node(new Cell(1, 7, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Dummy10: new Node(new Cell(0, 9, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
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
                next: (bar: () => boolean) => 'Dummy0_Dummy2'
            }
        },
        Dummy0_Dummy2: {
            edge: new Edge(['Dummy0', 'topRight'], ['Dummy2', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy2_Dummy2BA'
            }
        },
        Dummy2_Dummy2BA: {
            edge: new Edge(['Dummy2', 'topRight'], ['Dummy2B', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy2B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy2_Dummy2BB'
            }
        },
        Dummy2_Dummy2BB: {
            edge: new Edge(['Dummy2', 'bottomRight'], ['Dummy2B', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy2B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy2_Dummy5'
            }
        },
        Dummy2_Dummy5: {
            edge: new Edge(['Dummy2', 'bottomRight'], ['Dummy5', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy5_Dummy5BA'
            }
        },
        Dummy5_Dummy5BA: {
            edge: new Edge(['Dummy5', 'topRight'], ['Dummy5B', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy5B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy5_Dummy5BB'
            }
        },
        Dummy5_Dummy5BB: {
            edge: new Edge(['Dummy5', 'bottomRight'], ['Dummy5B', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy5B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy5_Dummy8'
            }
        },
        Dummy5_Dummy8: {
            edge: new Edge(['Dummy5', 'bottomRight'], ['Dummy8', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy8_Dummy8BA'
            }
        },
        Dummy8_Dummy8BA: {
            edge: new Edge(['Dummy8', 'topRight'], ['Dummy8B', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy8B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy8_Dummy8BB'
            }
        },
        Dummy8_Dummy8BB: {
            edge: new Edge(['Dummy8', 'bottomRight'], ['Dummy8B', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['Dummy8B', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy8_Dummy10'
            }
        },
        Dummy8_Dummy10: {
            edge: new Edge(['Dummy8', 'bottomRight'], ['Dummy10', 'bottomRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy2_Tools'
            }
        },
        Dummy2_Tools: {
            edge: new Edge(['Dummy2', 'center'], ['Tools', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_Dummy2'
            }
        },
        Tools_Dummy2: {
            edge: new Edge(['Tools', 'left'], ['Dummy2', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy5_AI'
            }
        },
        Dummy5_AI: {
            edge: new Edge(['Dummy5', 'center'], ['AI', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_Dummy5'
            }
        },
        AI_Dummy5: {
            edge: new Edge(['AI', 'left'], ['Dummy5', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Dummy8_Humans'
            }
        },
        Dummy8_Humans: {
            edge: new Edge(['Dummy8', 'center'], ['Humans', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_Dummy8'
            }
        },
        Humans_Dummy8: {
            edge: new Edge(['Humans', 'left'], ['Dummy8', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}


export const path: Array<[GraphElementNameType[], string]> = [
    [['Tools'],
        ''
    ],
    [['Tools_AI'],
        ''
    ],
    [['AI'],
        ''
    ],
    [['AI_Humans'],
        ''
    ],
    [['Humans'],
        ''
    ],
    [['Humans_Tools'],
        ''
    ],
    [['Tools'],
        ''
    ],
    [['Tools_Humans'],
        ''
    ],
    [['Humans'],
        ''
    ],
];




