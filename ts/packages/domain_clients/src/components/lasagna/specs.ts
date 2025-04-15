import { nodeDescriptions, pathDescriptions } from './texts/textsEng';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, EdgeWithConfig, GraphsElementNameType } from '@/components/lasagna/classes';


export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        Tools: new Node(new Cell(1, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Tools']),
        Graphs: new Node(new Cell(3, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Graphs']),
        Clients: new Node(new Cell(5, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Clients']),
        ToolsPrivate: new Node(new Cell(1, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['ToolsPrivate']),
        GraphsPrivate: new Node(new Cell(3, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['GraphsPrivate']),
        ClientsPrivate: new Node(new Cell(5, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['ClientsPrivate']),
        Resources: new Node(new Cell(3, 5, cellWidth, cellHeight), 'agnostic', 'data', true, nodeDescriptions['Resources']),
        ResourcesLeft: new Node(new Cell(1, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
        ResourcesRight: new Node(new Cell(5, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
    } as const;
}


export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        Tools_Graphs: {
            edge: new Edge(['Tools', 'right'], ['Graphs', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graphs_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graphs_Tools'
            }
        },
        Graphs_Tools: {
            edge: new Edge(['Graphs', 'left'], ['Tools', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tools_Graphs',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graphs_Clients'
            }
        },
        Graphs_Clients: {
            edge: new Edge(['Graphs', 'right'], ['Clients', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Clients_Graphs',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Clients_Graphs'
            }
        },
        Clients_Graphs: {
            edge: new Edge(['Clients', 'left'], ['Graphs', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graphs_Clients',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_ToolsPrivate'
            }
        },
        Tools_ToolsPrivate: {
            edge: new Edge(['Tools', 'bottom'], ['ToolsPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'ToolsPrivate_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ToolsPrivate_Tools'
            }
        },
        ToolsPrivate_Tools: {
            edge: new Edge(['ToolsPrivate', 'top'], ['Tools', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tools_ToolsPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graphs_GraphsPrivate'
            }
        },
        Graphs_GraphsPrivate: {
            edge: new Edge(['Graphs', 'bottom'], ['GraphsPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'GraphsPrivate_Graphs',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'GraphsPrivate_Graphs'
            }
        },
        GraphsPrivate_Graphs: {
            edge: new Edge(['GraphsPrivate', 'top'], ['Graphs', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Graphs_GraphsPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Clients_ClientsPrivate'
            }
        },
        Clients_ClientsPrivate: {
            edge: new Edge(['Clients', 'bottom'], ['ClientsPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'ClientsPrivate_Clients',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ClientsPrivate_Clients'
            }
        },
        ClientsPrivate_Clients: {
            edge: new Edge(['ClientsPrivate', 'top'], ['Clients', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Clients_ClientsPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tools_ResourcesLeft'
            }
        },
        Tools_ResourcesLeft: {
            edge: new Edge(['Tools', 'bottom'], ['ResourcesLeft', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'ResourcesLeft_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ResourcesLeft_Tools'
            }
        },
        ResourcesLeft_Tools: {
            edge: new Edge(['ResourcesLeft', 'top'], ['Tools', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(0, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Tools_ResourcesLeft',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Graphs_Resources'
            }
        },
        Graphs_Resources: {
            edge: new Edge(['Graphs', 'bottom'], ['Resources', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Resources_Graphs',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Resources_Graphs'
            }
        },
        Resources_Graphs: {
            edge: new Edge(['Resources', 'top'], ['Graphs', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Graphs_Resources',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Clients_ResourcesRight'
            }
        },
        Clients_ResourcesRight: {
            edge: new Edge(['Clients', 'bottom'], ['ResourcesRight', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'ResourcesRight_Clients',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ResourcesRight_Clients'
            }
        },
        ResourcesRight_Clients: {
            edge: new Edge(['ResourcesRight', 'top'], ['Clients', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Clients_ResourcesRight',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}


export const path: Array<[GraphsElementNameType[], string]> = [
    [[], pathDescriptions[0].Description],
    [['Clients_ResourcesRight'], pathDescriptions[1].Description],
    [['Clients_Graphs'], pathDescriptions[2].Description],
    [['Graphs_GraphsPrivate'], pathDescriptions[3].Description],
    [['GraphsPrivate_Graphs'], pathDescriptions[4].Description],
    [['Resources_Graphs'], pathDescriptions[5].Description],
    [['Resources_Graphs'], pathDescriptions[6].Description],
    [['Graphs_GraphsPrivate'], pathDescriptions[7].Description],
    [['GraphsPrivate_Graphs'], pathDescriptions[8].Description],
    [['Graphs_GraphsPrivate'], pathDescriptions[9].Description],
    [['Graphs_Resources'], pathDescriptions[10].Description],
    [['Graphs_Tools'], pathDescriptions[11].Description],
    [['ResourcesLeft_Tools'], pathDescriptions[12].Description],
    [['Tools_ToolsPrivate', 'ToolsPrivate_Tools', 'Tools_Graphs'], pathDescriptions[13].Description],
    [['Tools_ResourcesLeft'], pathDescriptions[14].Description],
];






