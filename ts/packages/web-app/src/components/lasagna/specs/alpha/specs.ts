import { nodeDescriptions, pathDescriptions } from '../texts';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, GraphElementNameType, EdgeWithConfig } from '@/components/lasagna/classes';


export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        AI: new Node(new Cell(2, 4, cellWidth, cellHeight), 'lg', 'code_ai', true, nodeDescriptions['AI']),
        Humans: new Node(new Cell(2, 7, cellWidth, cellHeight), 'vercel', 'code', true, nodeDescriptions['Humans']),
        Tools: new Node(new Cell(2, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyTop: new Node(new Cell(0, 0, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyTools: new Node(new Cell(0, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyToolsB: new Node(new Cell(1, 1, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyAI: new Node(new Cell(0, 4, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyAIB: new Node(new Cell(1, 4, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyHumans: new Node(new Cell(0, 7, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyHumansB: new Node(new Cell(1, 7, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        DummyBottom: new Node(new Cell(0, 9, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
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
                next: (bar: () => boolean) => 'DummyTop_DummyTools'
            }
        },
        DummyTop_DummyTools: {
            edge: new Edge(['DummyTop', 'topRight'], ['DummyTools', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyTools_DummyToolsBA'
            }
        },
        DummyTools_DummyToolsBA: {
            edge: new Edge(['DummyTools', 'topRight'], ['DummyToolsB', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyToolsB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyTools_DummyToolsBB'
            }
        },
        DummyTools_DummyToolsBB: {
            edge: new Edge(['DummyTools', 'bottomRight'], ['DummyToolsB', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyToolsB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyTools_DummyAI'
            }
        },
        DummyTools_DummyAI: {
            edge: new Edge(['DummyTools', 'bottomRight'], ['DummyAI', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyAI_DummyAIBA'
            }
        },
        DummyAI_DummyAIBA: {
            edge: new Edge(['DummyAI', 'topRight'], ['DummyAIB', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyAIB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyAI_DummyAIBB'
            }
        },
        DummyAI_DummyAIBB: {
            edge: new Edge(['DummyAI', 'bottomRight'], ['DummyAIB', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyAIB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyAI_DummyHumans'
            }
        },
        DummyAI_DummyHumans: {
            edge: new Edge(['DummyAI', 'bottomRight'], ['DummyHumans', 'topRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyHumans_DummyHumansBA'
            }
        },
        DummyHumans_DummyHumansBA: {
            edge: new Edge(['DummyHumans', 'topRight'], ['DummyHumansB', 'topLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyHumansB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyHumans_DummyHumansBB'
            }
        },
        DummyHumans_DummyHumansBB: {
            edge: new Edge(['DummyHumans', 'bottomRight'], ['DummyHumansB', 'bottomLeftD'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: ['DummyHumansB', 'left'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyHumans_DummyBottom'
            }
        },
        DummyHumans_DummyBottom: {
            edge: new Edge(['DummyHumans', 'bottomRight'], ['DummyBottom', 'bottomRight'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyTools_Tools'
            }
        },
        DummyTools_Tools: {
            edge: new Edge(['DummyTools', 'center'], ['Tools', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tools_DummyTools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_DummyTools'
            }
        },
        Tools_DummyTools: {
            edge: new Edge(['Tools', 'left'], ['DummyTools', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'DummyTools_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyAI_AI'
            }
        },
        DummyAI_AI: {
            edge: new Edge(['DummyAI', 'center'], ['AI', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_DummyAI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_DummyAI'
            }
        },
        AI_DummyAI: {
            edge: new Edge(['AI', 'left'], ['DummyAI', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'DummyAI_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'DummyHumans_Humans'
            }
        },
        DummyHumans_Humans: {
            edge: new Edge(['DummyHumans', 'center'], ['Humans', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Humans_DummyHumans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_DummyHumans'
            }
        },
        Humans_DummyHumans: {
            edge: new Edge(['Humans', 'left'], ['DummyHumans', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'DummyHumans_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}

export const validTransitions: Record<GraphElementNameType, GraphElementNameType[]> = {
    AI: ['AI_Tools', 'AI_Humans', 'AI_DummyAI'],
    Tools: ['Tools_AI', 'Tools_Humans', 'Tools_DummyTools'],
    Humans: ['Humans_AI', 'Humans_Tools', 'Humans_DummyHumans'],
    AI_Tools: ['Tools'],
    Tools_AI: ['AI'],
    AI_Humans: ['Humans'],
    Humans_AI: ['AI'],
    Tools_Humans: ['Humans'],
    Humans_Tools: ['Tools'],
    Tools_DummyTools: ['DummyTools'],
    DummyTools_Tools: ['Tools'],
    AI_DummyAI: ['DummyAI'],
    DummyAI_AI: ['AI'],
    Humans_DummyHumans: ['DummyHumans'],
    DummyHumans_Humans: ['Humans'],
};

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
    [['Humans_DummyHumans'],
        ''
    ],
    [[],
        ''
    ],
    [['DummyHumans_Humans'],
        ''
    ],
    [['Humans'],
        ''
    ],
];




