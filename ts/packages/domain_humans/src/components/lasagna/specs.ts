import { nodeDescriptions } from './texts/textsEng';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, EdgeWithConfig } from '@/components/lasagna/classes';

export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        Tools: new Node(new Cell(1, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Tools']),
        Strategies: new Node(new Cell(3, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Strategies']),
        Humans: new Node(new Cell(5, 1, cellWidth, cellHeight), 'agnostic', 'code', true, nodeDescriptions['Humans']),
        ToolsPrivate: new Node(new Cell(1, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['ToolsPrivate']),
        StrategiesPrivate: new Node(new Cell(3, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['StrategiesPrivate']),
        HumansPrivate: new Node(new Cell(5, 3, cellWidth, cellHeight), 'agnostic', 'data_Private', true, nodeDescriptions['HumansPrivate']),
        Resources: new Node(new Cell(3, 5, cellWidth, cellHeight), 'agnostic', 'data', true, nodeDescriptions['Resources']),
        ResourcesLeft: new Node(new Cell(1, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
        ResourcesRight: new Node(new Cell(5, 5, cellWidth, cellHeight), 'agnostic', 'dummy', true, nodeDescriptions['Resources']),
    } as const;
}

// ATTENTION: invoke/invoke edges and read/write edges
export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        Tools_Strategies: {
            edge: new Edge(['Tools', 'right'], ['Strategies', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Strategies_Tools',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Strategies_Tools'
            }
        },
        Strategies_Tools: {
            edge: new Edge(['Strategies', 'left'], ['Tools', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Tools_Strategies',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Strategies_Humans'
            }
        },
        Strategies_Humans: {
            edge: new Edge(['Strategies', 'right'], ['Humans', 'left'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Humans_Strategies',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_Strategies'
            }
        },
        Humans_Strategies: {
            edge: new Edge(['Humans', 'left'], ['Strategies', 'right'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Strategies_Humans',
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
                next: (bar: () => boolean) => 'Strategies_StrategiesPrivate'
            }
        },
        Strategies_StrategiesPrivate: {
            edge: new Edge(['Strategies', 'bottom'], ['StrategiesPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'StrategiesPrivate_Strategies',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'StrategiesPrivate_Strategies'
            }
        },
        StrategiesPrivate_Strategies: {
            edge: new Edge(['StrategiesPrivate', 'top'], ['Strategies', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Strategies_StrategiesPrivate',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_HumansPrivate'
            }
        },
        Humans_HumansPrivate: {
            edge: new Edge(['Humans', 'bottom'], ['HumansPrivate', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'HumansPrivate_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'HumansPrivate_Humans'
            }
        },
        HumansPrivate_Humans: {
            edge: new Edge(['HumansPrivate', 'top'], ['Humans', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: 'Humans_HumansPrivate',
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
                next: (bar: () => boolean) => 'Strategies_Resources'
            }
        },
        Strategies_Resources: {
            edge: new Edge(['Strategies', 'bottom'], ['Resources', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Resources_Strategies',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Resources_Strategies'
            }
        },
        Resources_Strategies: {
            edge: new Edge(['Resources', 'top'], ['Strategies', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Strategies_Resources',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Humans_ResourcesRight'
            }
        },
        Humans_ResourcesRight: {
            edge: new Edge(['Humans', 'bottom'], ['ResourcesRight', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'ResourcesRight_Humans',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'ResourcesRight_Humans'
            }
        },
        ResourcesRight_Humans: {
            edge: new Edge(['ResourcesRight', 'top'], ['Humans', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(4, 3, cellWidth, cellHeight), 'left'],
                reverse: 'Humans_ResourcesRight',
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => null
            }
        },
    }
}


export const path = [];






