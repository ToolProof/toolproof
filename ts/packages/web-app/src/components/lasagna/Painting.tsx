'use client';
import ResourceSVG from './ResourceSVG';
import { Point, Resource, Arrow, GraphElementNameType, ResourceNameType, ArrowNameType, ArrowWithConfig } from './classes';
import { useState, useRef, useEffect } from 'react';

interface PaintingProps {
    resources: Record<ResourceNameType, Resource>;
    arrowsWithConfig: Record<ArrowNameType, ArrowWithConfig>
    path: Array<[GraphElementNameType[], string]>
    gridSize: number;
    cellWidth: number;
    cellHeight: number;
    checkIfActive: (key: GraphElementNameType) => boolean;
    bar: () => boolean;
    showBeta: boolean;
}

export default function Painting({ resources, arrowsWithConfig, path, gridSize, cellWidth, cellHeight, checkIfActive, bar, showBeta }: PaintingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [resourceName, setResourceName] = useState<ResourceNameType | null>(null);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });

    const handleResourceClick = (resourceName: ResourceNameType, x: number, y: number) => {
        setResourceName(resourceName);
        setBoxPosition({ top: y + cellHeight, left: x - cellWidth / 1.5 }); // Adjusted top value to position the box below the resource
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const drawGrid = () => {
            for (let col = 0; col < gridSize; col++) {
                for (let row = 0; row < gridSize; row++) {
                    context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
                }
            }
        };

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // drawGrid();

        // Draw resources stroke
        Object.entries(resources).forEach(([key, resource]) => {
            const isActive = checkIfActive(key as ArrowNameType);
            const color = isActive ? 'yellow' : 'black';
            resource.draw(context, color, false);
            resource.drawText(context, key);
        });

        const foo = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
            const isActive = checkIfActive(key);
            let color = isActive ? 'yellow' : 'black';
            color = (isActive && key.includes('Checkpoints')) ? 'red' : color;

            if (arrowWithConfig.config.controlPoint) {
                // Draw curved arrow line
                arrowWithConfig.arrow.drawCurvy(
                    context,
                    arrowWithConfig.config.controlPoint,
                    resources,
                    color
                );
                // Store arrowhead for later
                if (isActive) {
                    const controlPoint = Arrow.resolvePoint(arrowWithConfig.config.controlPoint, resources);
                    arrowheadQueue.push({ start: arrowWithConfig.arrow.startPoint, end: arrowWithConfig.arrow.endPoint, color, isCurvy: true, control: controlPoint });
                }
            } else {
                // Draw straight arrow line
                arrowWithConfig.arrow.draw(context, color);
                // Store arrowhead for later
                if (isActive) {
                    arrowheadQueue.push({ start: arrowWithConfig.arrow.startPoint, end: arrowWithConfig.arrow.endPoint, color, isCurvy: false });
                }
            }

            const nextKey = arrowWithConfig.config.next(bar); // ATTENTION_Z
            if (nextKey) {
                const nextArrowWithConfig = arrowsWithConfig[nextKey];
                nextArrowWithConfig.config.drawInOrder(foo, nextKey, nextArrowWithConfig);
            }
        };

        // Store arrowheads separately
        const arrowheadQueue: { start: Point; end: Point; color: string; isCurvy: boolean; control?: Point }[] = [];

        // Draw arrows and queue arrowheads
        const key = 'Human_Anchors';
        const genesisArrowWithConfig = arrowsWithConfig[key];
        if (genesisArrowWithConfig && genesisArrowWithConfig.config) {
            genesisArrowWithConfig.config.drawInOrder(foo, key, genesisArrowWithConfig);
        } else {
            console.error(`Arrow with config for key '${key}' is undefined or missing config.`);
        }

        // Draw all arrowheads after all lines
        arrowheadQueue.forEach(({ start, end, color, isCurvy, control }) => {
            if (isCurvy && control) {
                Arrow.prototype.drawCurvyArrowhead(context, start, control, end, color);
            } else {
                Arrow.prototype.drawArrowhead(context, start, end, color);
            }
        });

    }, [arrowsWithConfig, cellHeight, cellWidth, gridSize, resources, path, checkIfActive, bar]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Add Canvas */}
            <canvas
                ref={canvasRef}
                width={gridSize * cellWidth}
                height={gridSize * cellHeight}
                style={{ position: 'absolute', top: 0, left: 0, background: 'transparent', pointerEvents: 'none' }}
            />
            {/* Draw ResourceSVGs */}
            <svg width={gridSize * cellWidth} height={gridSize * cellHeight} viewBox={`0 0 ${gridSize * cellWidth} ${gridSize * cellHeight}`}>
                {Object.entries(resources).map(([key, resource]) => {
                    const color = resource.getFillColor();
                    return <ResourceSVG key={key} resourceName={key as ResourceNameType} resource={resource} color={color} handleResourceClickHelper={(resourceName) => handleResourceClick(resourceName as ResourceNameType, resource.cell.col * cellWidth, resource.cell.row * cellHeight)} />;
                })}
            </svg>
            {/* Draw ResourceDescription */}
            {(resourceName) && (
                <div style={{ position: 'absolute', top: boxPosition.top, left: boxPosition.left, backgroundColor: 'pink', padding: '10px', border: '1px solid black', zIndex: 10, borderRadius: '5px', width: (resourceName !== 'Papers' && !resourceName.includes('Glue')) ? '350px' : '250px', height: resourceName === 'Human' ? '100px' : '250px', overflowY: 'auto' }}>
                    <button onClick={() => setResourceName(null)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>✖</button>
                    <p>{resources[resourceName].description}</p>
                </div>
            )}
        </div>
    );
}