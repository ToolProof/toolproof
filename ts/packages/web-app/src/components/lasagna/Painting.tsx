'use client';
import ResourceSVG from './ResourceSVG';
import { Point, Resource, Arrow, GraphElementNameType, ResourceNameType, ArrowNameType, ArrowWithConfig } from './classes';
import { useState, useRef, useEffect } from 'react';

interface PaintingProps {
    resources: Record<ResourceNameType, Resource>;
    arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig>
    path: Array<[GraphElementNameType[], string]>
    isElementActive: (key: GraphElementNameType) => boolean;
    bar: () => boolean;
    showAssistant: boolean;
}

export default function Painting({ resources, arrowsWithConfig, path, isElementActive, bar, showAssistant }: PaintingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const [resourceName, setResourceName] = useState<ResourceNameType | null>(null);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });

    const cellWidthRef = useRef(0);
    const cellHeightRef = useRef(0);
    const [cellWidth, setCellWidth] = useState(0);
    const [cellHeight, setCellHeight] = useState(0);

    const gridSize = 5;

    const handleResourceClick = (resourceName: ResourceNameType, x: number, y: number) => {
        setResourceName(resourceName);
        setBoxPosition({ top: y + cellHeight, left: x - cellWidth / 1.5 });
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (parentRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = parentRef.current;
                const newCellWidth = Math.floor(clientWidth / gridSize);
                const newCellHeight = Math.floor(clientHeight / gridSize);

                if (newCellWidth !== cellWidthRef.current || newCellHeight !== cellHeightRef.current) {
                    cellWidthRef.current = newCellWidth;
                    cellHeightRef.current = newCellHeight;
                    setCellWidth(newCellWidth);
                    setCellHeight(newCellHeight);

                    const canvas = canvasRef.current;
                    canvas.width = clientWidth;
                    canvas.height = clientHeight;
                }
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [gridSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Clear the canvas before redrawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the grid
        for (let col = 0; col < gridSize; col++) {
            for (let row = 0; row < gridSize; row++) {
                context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            }
        }

        // Draw resources
        Object.entries(resources).forEach(([key, resource]) => {
            const isActive = isElementActive(key as ResourceNameType);
            const color = isActive ? 'yellow' : 'black';
            resource.draw(context, color, key as ResourceNameType, showAssistant);
        });

        // Draw resource labels
        Object.entries(resources).forEach(([key, resource]) => {
            resource.drawText(context, key, showAssistant);
        });

        // Draw arrows
        const arrowheadQueue: { start: Point; end: Point; color: string; isCurvy: boolean; control?: Point }[] = [];

        const foo = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
            const isActive = isElementActive(key);
            const color = isActive ? 'yellow' : 'black';

            if (arrowWithConfig.config.controlPoint) {
                arrowWithConfig.arrow.drawCurvy(
                    context,
                    arrowWithConfig.config.controlPoint,
                    resources,
                    color
                );
                if (isActive) {
                    const controlPoint = Arrow.resolvePoint(arrowWithConfig.config.controlPoint, resources);
                    arrowheadQueue.push({ start: arrowWithConfig.arrow.startPoint, end: arrowWithConfig.arrow.endPoint, color, isCurvy: true, control: controlPoint });
                }
            } else {
                arrowWithConfig.arrow.draw(context, color);
                if (isActive) {
                    arrowheadQueue.push({ start: arrowWithConfig.arrow.startPoint, end: arrowWithConfig.arrow.endPoint, color, isCurvy: false });
                }
            }

            const nextKey = arrowWithConfig.config.next(bar);
            if (nextKey) {
                const nextArrowWithConfig = arrowsWithConfig[nextKey];
                nextArrowWithConfig.config.drawInOrder(foo, nextKey, nextArrowWithConfig);
            }
        };

        const key = 'AI_Tools';
        const genesisArrowWithConfig = arrowsWithConfig[key];
        if (genesisArrowWithConfig && genesisArrowWithConfig.config) {
            genesisArrowWithConfig.config.drawInOrder(foo, key, genesisArrowWithConfig);
        }

        arrowheadQueue.forEach(({ start, end, color, isCurvy, control }) => {
            if (isCurvy && control) {
                Arrow.prototype.drawCurvyArrowhead(context, start, control, end, color);
            } else {
                Arrow.prototype.drawArrowhead(context, start, end, color);
            }
        });

    }, [arrowsWithConfig, cellHeight, cellWidth, gridSize, resources, path, isElementActive, bar, showAssistant]);

    return (
        <div ref={parentRef} className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full bg-pink-700 overflow-hidden pointer-events-none"
            />
            {(resourceName) && (
                <div style={{
                    position: 'absolute',
                    top: boxPosition.top,
                    left: boxPosition.left,
                    backgroundColor: 'pink',
                    padding: '10px',
                    border: '1px solid black',
                    zIndex: 10,
                    borderRadius: '5px',
                    width: '350px',
                    height: resourceName === 'Humans' ? '100px' : '250px',
                    overflowY: 'auto'
                }}>
                    <button onClick={() => setResourceName(null)} style={{
                        float: 'right',
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}>✖</button>
                    <p>{resources[resourceName].description}</p>
                </div>
            )}
        </div>
    );
}
