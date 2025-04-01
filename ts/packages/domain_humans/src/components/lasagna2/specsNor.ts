import { nodeDescriptions, pathDescriptions } from './texts/textsNor';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, GraphElementNameType, EdgeWithConfig } from '@/components/lasagna/classes';

export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        AI: new Node(new Cell(2, 5, cellWidth, cellHeight), 'lg', 'code_ai', true, nodeDescriptions['AI']),
        Humans: new Node(new Cell(2, 8, cellWidth, cellHeight), 'vercel', 'code', true, nodeDescriptions['Humans']),
        Tools: new Node(new Cell(2, 2, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['Tools']),
        Standin: new Node(new Cell(2, 2, cellWidth, cellHeight), 'gcp', 'code_ai', true, nodeDescriptions['Tools']),
        Data: new Node(new Cell(0, 5, cellWidth, cellHeight), 'gcp', 'data', true, nodeDescriptions['Data']),
        Meta: new Node(new Cell(1, 5, cellWidth, cellHeight), 'lg', 'data_meta', true, nodeDescriptions['Meta']),
        MetaInternal: new Node(new Cell(0, 5, cellWidth, cellHeight), 'gcp', 'data_meta', true, nodeDescriptions['Data']),
    } as const;
}

// ATTENTION: invoke/invoke edges and read/write edges
export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        AI_Tools: {
            edge: new Edge(['AI', 'top'], ['Tools', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
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
                reverse: null,
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
                reverse: null,
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
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_Humans'
            }
        },
        Tools_Humans: {
            edge: new Edge(['Tools', 'right'], ['Humans', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 5, cellWidth, cellHeight), 'left'],
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
                controlPoint: [new Cell(4, 5, cellWidth, cellHeight), 'left'],
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
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
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
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
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
                controlPoint: [new Cell(0, 7, cellWidth, cellHeight), 'left'],
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
                controlPoint: [new Cell(0, 7, cellWidth, cellHeight), 'left'],
                reverse: 'Data_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Meta_AI'
            }
        },
        Meta_AI: {
            edge: new Edge(['Meta', 'center'], ['AI', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_Data',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_Meta'
            }
        },
        AI_Meta: {
            edge: new Edge(['AI', 'left'], ['Meta', 'center'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Data_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'AI_Standin'
            }
        },
        AI_Standin: {
            edge: new Edge(['AI', 'top'], ['Standin', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Standin_AI',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Standin_AI'
            }
        },
        Standin_AI: {
            edge: new Edge(['Standin', 'bottom'], ['AI', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'AI_Standin',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Standin_Humans'
            }
        },
        Standin_Humans: {
            edge: new Edge(['Standin', 'right'], ['Humans', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 5, cellWidth, cellHeight), 'left'],
                reverse: 'Humans_Standin',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_Standin'
            }
        },
        Humans_Standin: {
            edge: new Edge(['Humans', 'right'], ['Standin', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 5, cellWidth, cellHeight), 'left'],
                reverse: 'Standin_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Data_Standin'
            }
        },
        Data_Standin: {
            edge: new Edge(['Data', 'top'], ['Standin', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Standin_Data',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Standin_Data'
            }
        },
        Standin_Data: {
            edge: new Edge(['Standin', 'left'], ['Data', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Data_Standin',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}

/* export const validTransitions: Record<GraphElementNameType, GraphElementNameType[]> = {
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
}; */


export const path: Array<[GraphElementNameType[], string]> = [
    [[], pathDescriptions[0]],
    [['Humans', 'Humans_Data', 'Data'], pathDescriptions[1]],
    [['Data', 'Data_AI', 'AI', 'Meta_AI'], pathDescriptions[2]],
    [['AI', 'AI_Data', 'Data', 'AI_Meta'], pathDescriptions[3]],
    [['Data', 'Data_Tools', 'Tools', 'Data_Standin', 'Standin'], pathDescriptions[4]],
    [['Tools', 'Tools_Data', 'Data', 'Standin_Data', 'Standin'], pathDescriptions[5]],
    [['Data', 'Data_AI', 'AI', 'Meta_AI'], pathDescriptions[6]],
    [['AI', 'AI_Data', 'Data', 'AI_Meta'], pathDescriptions[7]],
    [['Data', 'Data_Humans', 'Humans'], pathDescriptions[8]],
    [['Humans', 'Humans_AI', 'AI', 'AI_Humans'], pathDescriptions[9]],
];






