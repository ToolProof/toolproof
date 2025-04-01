'use client';
import NodeSVG from './NodeSVG';
import { Point, Node, Edge, GraphElementNameType, NodeNameType, EdgeNameType, EdgeWithConfig } from './classes';
import { getNodes, getEdgesWithConfig } from './specs';
import { getNodes as getNodesNor, getEdgesWithConfig as getEdgesWithConfigNor } from './specsNor';
import { useState, useRef, useEffect, useMemo } from 'react';

interface PaintingProps {
    isElementActive: (key: GraphElementNameType) => boolean;
    counter: number;
    showStandin: boolean;
    isNor: boolean;
}

export default function Painting({ isElementActive, counter, showStandin, isNor }: PaintingProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodeName, setNodeName] = useState<NodeNameType | null>(null);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });

    const cellWidthRef = useRef(0);
    const cellHeightRef = useRef(0);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);

    const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

    const [nodes, setNodes] = useState<Record<NodeNameType, Node>>();
    const [edgesWithConfig, setEdgesWithConfig] = useState<Record<EdgeNameType, EdgeWithConfig>>();

    const gridSize = useMemo(() => ({
        col: 7,
        row: 9,
    }), []);

    const handleNodeClick = (nodeName: NodeNameType, x: number, y: number) => {
        console.log('nodeName', nodeName);
        setNodeName(nodeName);
        setBoxPosition({ top: y + cellHeight, left: x - cellWidth / 1.5 });
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (parentRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = parentRef.current;
                const newCellWidth = Math.floor(clientWidth / gridSize.col);
                const newCellHeight = Math.floor(clientHeight / gridSize.row);

                if (newCellWidth !== cellWidthRef.current || newCellHeight !== cellHeightRef.current) {
                    cellWidthRef.current = newCellWidth;
                    cellHeightRef.current = newCellHeight;
                    setCellWidth(newCellWidth);
                    setCellHeight(newCellHeight);

                    const canvas = canvasRef.current;
                    canvas.width = clientWidth;
                    canvas.height = clientHeight;

                    // ✅ Update SVG dimensions dynamically
                    setSvgSize({ width: clientWidth, height: clientHeight });
                }
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [gridSize]);

    useEffect(() => {
        if (isNor) {
            setNodes(getNodesNor(cellWidth, cellHeight));
            setEdgesWithConfig(getEdgesWithConfigNor(cellWidth, cellHeight));
        } else {
            const nodes = getNodes(cellWidth, cellHeight);
            setNodes(nodes);
            const edgesWithConfig = getEdgesWithConfig(cellWidth, cellHeight);
            setEdgesWithConfig(edgesWithConfig);
        }
    }, [cellHeight, cellWidth, isNor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        if (!nodes) return;
        if (!edgesWithConfig) return;

        // Clear the canvas before redrawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the grid
        /* for (let col = 0; col < gridSize.col; col++) {
            for (let row = 0; row < gridSize.row; row++) {
                context.strokeStyle = 'black';
                context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        } */

        // Draw nodes
        Object.entries(nodes).forEach(([key, node]) => {
            const isActive = isElementActive(key as NodeNameType);
            const color = isActive ? 'yellow' : 'black';
            node.draw(context, color, key as NodeNameType, showStandin);
        });

        Object.entries(nodes).forEach(([key, node]) => {
            node.drawText(context, key, counter);
        });


        // Draw edges
        const edgeheadQueue: { key: EdgeNameType, start: Point; end: Point; color: string; isCurvy: boolean; control?: Point }[] = [];

        const bar = () => {
            return false;
        };

        const foo = (key: EdgeNameType, edgeWithConfig: EdgeWithConfig) => {
            const isReverseActive = edgeWithConfig.config.reverse ? isElementActive(edgeWithConfig.config.reverse) : false;
            const isActive = isElementActive(key);
            const color = isActive ? 'yellow' : 'black';


            if (isActive || key === 'PreviousNode_Node' || key === 'Node_NextNode') {
                if (edgeWithConfig.config.controlPoint) {
                    edgeWithConfig.edge.drawCurvy(
                        context,
                        edgeWithConfig.config.controlPoint,
                        nodes,
                        color
                    );
                    if (isActive) {
                        const controlPoint = Edge.resolvePoint(edgeWithConfig.config.controlPoint, nodes);
                        edgeheadQueue.push({ key, start: edgeWithConfig.edge.startPoint, end: edgeWithConfig.edge.endPoint, color, isCurvy: true, control: controlPoint });
                    }
                } else {
                    if (key !== 'PreviousNode_Node' && key !== 'Node_NextNode') {
                        edgeWithConfig.edge.draw(context, color);
                    }
                    if (isActive || key === 'PreviousNode_Node' || key === 'Node_NextNode') {
                        edgeheadQueue.push({ key, start: edgeWithConfig.edge.startPoint, end: edgeWithConfig.edge.endPoint, color, isCurvy: false });
                    }
                }
            }

            const nextKey = edgeWithConfig.config.next(bar);
            if (nextKey) {
                const nextEdgeWithConfig = edgesWithConfig[nextKey];
                nextEdgeWithConfig.config.drawInOrder(foo, nextKey, nextEdgeWithConfig);
            }
        };

        const key = 'Node_GraphState';
        const genesisEdgeWithConfig = edgesWithConfig[key];
        if (genesisEdgeWithConfig && genesisEdgeWithConfig.config) {
            genesisEdgeWithConfig.config.drawInOrder(foo, key, genesisEdgeWithConfig);
        }

        edgeheadQueue.forEach(({ key, start, end, color, isCurvy, control }) => {
            if (isCurvy && control) {
                Edge.prototype.drawCurvyEdgehead(context, start, control, end, color);
            } else {
                Edge.prototype.drawEdgehead(context, start, end, color, key === 'PreviousNode_Node' || key === 'Node_NextNode');
            }
        });

    }, [edgesWithConfig, cellHeight, cellWidth, gridSize, nodes, isElementActive, showStandin, isNor, counter]);


    return (
        <div ref={parentRef} className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full bg-transparent overflow-hidden pointer-events-none"
            />
            {/* Draw NodeSVGs */}
            {nodes && (
                <svg width={svgSize.width} height={svgSize.height} className="absolute top-0 left-0 bg-transparent">
                    {Object.entries(nodes).map(([key, node]) => {
                        const color = 'transparent'; // node.getFillColor(); // ATTENTION
                        return (
                            <NodeSVG
                                key={key}
                                nodeName={key as NodeNameType}
                                node={node}
                                color={color}
                                handleNodeClickHelper={(nodeName) =>
                                    handleNodeClick(nodeName as NodeNameType, node.cell.col * cellWidth, node.cell.row * cellHeight)
                                }
                                showStandin={showStandin}
                            />
                        );
                    })}
                </svg>
            )}
            {nodes && nodeName && (
                <div
                    style={{
                        position: 'absolute',
                        top: boxPosition.top,
                        left: boxPosition.left,
                        backgroundColor: 'pink',
                        padding: '10px',
                        border: '1px solid black',
                        zIndex: 10,
                        borderRadius: '5px',
                        width: '350px',
                        height: nodeName === 'Humans' ? '100px' : '250px',
                        overflowY: 'auto',
                    }}
                >
                    <button
                        onClick={() => setNodeName(null)}
                        style={{
                            float: 'right',
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                        }}
                    >
                        ✖
                    </button>
                    <p>{nodes[nodeName].description}</p>
                </div>
            )}
        </div>
    );
}
