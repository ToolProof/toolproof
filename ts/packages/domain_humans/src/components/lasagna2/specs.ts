import { nodeDescriptions, pathDescriptions } from './texts/textsEng';
import { Cell, NodeNameType, EdgeNameType, Node, Edge, GraphElementNameType, EdgeWithConfig } from '@/components/lasagna2/classes';

export const getNodes = (cellWidth: number, cellHeight: number): Record<NodeNameType, Node> => {
    return {
        Node: new Node(new Cell(4, 4, cellWidth, cellHeight), 'lg', 'data', true, nodeDescriptions['Node']),
        PreviousNode: new Node(new Cell(4, 1, cellWidth, cellHeight), 'lg', 'data', true, nodeDescriptions['PreviousNode']),
        NextNode: new Node(new Cell(4, 7, cellWidth, cellHeight), 'lg', 'data', true, nodeDescriptions['NextNode']),
        Tool: new Node(new Cell(6, 4, cellWidth, cellHeight), 'lg', 'data', true, nodeDescriptions['Tool']),
        GraphState: new Node(new Cell(2, 4, cellWidth, cellHeight), 'lg', 'code', true, nodeDescriptions['GraphState']),
        FileStorage: new Node(new Cell(0, 4, cellWidth, cellHeight), 'gcp', 'code', true, nodeDescriptions['FileStorage']),
    } as const;
}

// ATTENTION: invoke/invoke edges and read/write edges
export const getEdgesWithConfig = (cellWidth: number, cellHeight: number): Record<EdgeNameType, EdgeWithConfig> => {
    const nodes = getNodes(cellWidth, cellHeight);
    return {
        Node_GraphState: {
            edge: new Edge(['Node', 'bottom'], ['GraphState', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 5, cellWidth, cellHeight), 'bottom'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'GraphState_Node'
            }
        },
        GraphState_Node: {
            edge: new Edge(['GraphState', 'top'], ['Node', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 3, cellWidth, cellHeight), 'top'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Node_FileStorage'
            }
        },
        Node_FileStorage: {
            edge: new Edge(['Node', 'bottom'], ['FileStorage', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 6, cellWidth, cellHeight), 'bottom'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'FileStorage_Node'
            }
        },
        FileStorage_Node: {
            edge: new Edge(['FileStorage', 'top'], ['Node', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 2, cellWidth, cellHeight), 'top'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Tool_FileStorage'
            }
        },
        Tool_FileStorage: {
            edge: new Edge(['Tool', 'bottom'], ['FileStorage', 'bottom'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 8, cellWidth, cellHeight), 'bottom'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'FileStorage_Tool'
            }
        },
        FileStorage_Tool: {
            edge: new Edge(['FileStorage', 'top'], ['Tool', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: [new Cell(2, 0, cellWidth, cellHeight), 'top'],
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'PreviousNode_Node'
            }
        },
        PreviousNode_Node: {
            edge: new Edge(['PreviousNode', 'bottom'], ['Node', 'top'], nodes, cellWidth, cellHeight),
            config: {
                controlPoint: null,
                reverse: null,
                drawInOrder: (foo, key, edgeWithConfig) => {
                    foo(key, edgeWithConfig);
                },
                next: (bar: () => boolean) => 'Node_NextNode'
            }
        },
        Node_NextNode: {
            edge: new Edge(['Node', 'bottom'], ['NextNode', 'top'], nodes, cellWidth, cellHeight),
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
    [[], pathDescriptions[0].Description],
    [[], pathDescriptions[1].Description],
    [['FileStorage_Node'], pathDescriptions[2].Description],
    [['Node_GraphState'], pathDescriptions[3].Description],
    [['GraphState_Node'], pathDescriptions[4].Description],
    [['FileStorage_Node'], pathDescriptions[5].Description],
    [['Node_GraphState'], pathDescriptions[6].Description],
];






