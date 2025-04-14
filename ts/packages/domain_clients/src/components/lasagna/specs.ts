import { nodeDescriptions, pathDescriptions } from './texts/textsEng';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, EdgeWithConfig, GraphElementNameType } from '@/components/lasagna/classes';


export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        Tool: new Node(new Cell(1, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Tool']),
        Graph: new Node(new Cell(3, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Graph']),
        Client: new Node(new Cell(5, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Client']),
        ToolPrivate: new Node(new Cell(1, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['ToolPrivate']),
        GraphPrivate: new Node(new Cell(3, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['GraphPrivate']),
        ClientPrivate: new Node(new Cell(5, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['ClientPrivate']),
        Resources: new Node(new Cell(3, 5, cellWidth, cellHeight), 'agnostic', 'data', true, nodeDescriptions['Resources']),
        ResourcesLeft: new Node(new Cell(1, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
        ResourcesRight: new Node(new Cell(5, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
    } as const;
}


export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        Tool_Graph: {
            edge: new Edge(['Tool', 'right'], ['Graph', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graph_Tool',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graph_Tool'
            }
        },
        Graph_Tool: {
            edge: new Edge(['Graph', 'left'], ['Tool', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tool_Graph',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graph_Client'
            }
        },
        Graph_Client: {
            edge: new Edge(['Graph', 'right'], ['Client', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Client_Graph',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Client_Graph'
            }
        },
        Client_Graph: {
            edge: new Edge(['Client', 'left'], ['Graph', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graph_Client',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tool_ToolPrivate'
            }
        },
        Tool_ToolPrivate: {
            edge: new Edge(['Tool', 'bottom'], ['ToolPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'ToolPrivate_Tool',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ToolPrivate_Tool'
            }
        },
        ToolPrivate_Tool: {
            edge: new Edge(['ToolPrivate', 'top'], ['Tool', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tool_ToolPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graph_GraphPrivate'
            }
        },
        Graph_GraphPrivate: {
            edge: new Edge(['Graph', 'bottom'], ['GraphPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'GraphPrivate_Graph',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'GraphPrivate_Graph'
            }
        },
        GraphPrivate_Graph: {
            edge: new Edge(['GraphPrivate', 'top'], ['Graph', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graph_GraphPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Client_ClientPrivate'
            }
        },
        Client_ClientPrivate: {
            edge: new Edge(['Client', 'bottom'], ['ClientPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'ClientPrivate_Client',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ClientPrivate_Client'
            }
        },
        ClientPrivate_Client: {
            edge: new Edge(['ClientPrivate', 'top'], ['Client', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Client_ClientPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tool_ResourcesLeft'
            }
        },
        Tool_ResourcesLeft: {
            edge: new Edge(['Tool', 'bottom'], ['ResourcesLeft', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'ResourcesLeft_Tool',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ResourcesLeft_Tool'
            }
        },
        ResourcesLeft_Tool: {
            edge: new Edge(['ResourcesLeft', 'top'], ['Tool', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Tool_ResourcesLeft',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graph_Resources'
            }
        },
        Graph_Resources: {
            edge: new Edge(['Graph', 'bottom'], ['Resources', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Resources_Graph',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Resources_Graph'
            }
        },
        Resources_Graph: {
            edge: new Edge(['Resources', 'top'], ['Graph', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Graph_Resources',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Client_ResourcesRight'
            }
        },
        Client_ResourcesRight: {
            edge: new Edge(['Client', 'bottom'], ['ResourcesRight', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'ResourcesRight_Client',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ResourcesRight_Client'
            }
        },
        ResourcesRight_Client: {
            edge: new Edge(['ResourcesRight', 'top'], ['Client', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Client_ResourcesRight',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}


export const path: Array<[GraphElementNameType[], string]> = [
    [[], pathDescriptions[0].Description],
    [['Client_ResourcesRight'], pathDescriptions[1].Description],
    [['Client_Graph'], pathDescriptions[2].Description],
    [['Graph_GraphPrivate'], pathDescriptions[3].Description],
    [['GraphPrivate_Graph'], pathDescriptions[4].Description],
    [['Resources_Graph'], pathDescriptions[5].Description],
    [['Resources_Graph'], pathDescriptions[6].Description],
    [['Graph_GraphPrivate'], pathDescriptions[7].Description],
    [['GraphPrivate_Graph'], pathDescriptions[8].Description],
    [['Graph_GraphPrivate'], pathDescriptions[9].Description],
    [['Graph_Resources'], pathDescriptions[10].Description],
    [['Graph_Tool'], pathDescriptions[11].Description],
    [['ResourcesLeft_Tool'], pathDescriptions[12].Description],
    [['Tool_ToolPrivate', 'ToolPrivate_Tool', 'Tool_Graph'], pathDescriptions[13].Description],
    [['Tool_ResourcesLeft'], pathDescriptions[14].Description],
];






