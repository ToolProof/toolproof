'use client';
import ResourceSVG from './ResourceSVG';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Point, Arrow, ResourceNameType, ArrowNameType, ArrowWithConfig } from './types';
import { useRef, useEffect } from 'react';

interface LasagnaProps {
    z: number;
    showGlue: boolean;
}

export default function Lasagna({ z, showGlue }: LasagnaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw resources
        Object.entries(resources).forEach(([key, resource]) => {
            const color = sequence[z][0].includes(key as ResourceNameType) ? 'yellow' : 'black';
            resource.draw(context, color, false);
            resource.drawText(context, key);
        });

        const foo = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
            const isActive = sequence[z][0].includes(key as ArrowNameType);
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

            const nextKey = arrowWithConfig.config.next(z);
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
        genesisArrowWithConfig.config.drawInOrder(foo, key, genesisArrowWithConfig);

        // Draw all arrowheads after all lines
        arrowheadQueue.forEach(({ start, end, color, isCurvy, control }) => {
            if (isCurvy && control) {
                Arrow.prototype.drawCurvyArrowhead(context, start, control, end, color);
            } else {
                Arrow.prototype.drawArrowhead(context, start, end, color);
            }
        });

    }, [z]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={gridSize * cellWidth}
                height={gridSize * cellHeight}
                style={{ position: 'absolute', top: 0, left: 0, background: 'transparent', pointerEvents: 'none' }}
            />
            <svg width={gridSize * cellWidth} height={gridSize * cellHeight} viewBox={`0 0 ${gridSize * cellWidth} ${gridSize * cellHeight}`}>
                {/* Grid */}
                {/* {Array.from({ length: gridSize }).map((_, col) =>
                    Array.from({ length: gridSize }).map((_, row) => (
                        <rect
                            key={`grid-${col}-${row}`}
                            x={col * cellWidth}
                            y={row * cellHeight}
                            width={cellWidth}
                            height={cellHeight}
                            stroke="gray"
                            fill="transparent"
                        />
                    ))
                )} */}
                {/* Draw Resources */}
                {Object.entries(resources).map(([key, resource]) => {
                    if (resource.nature === 'code_glue' && !showGlue) return null;
                    const color = resource.getFillColor();
                    return <ResourceSVG key={key} name={key as ResourceNameType} resource={resource} color={color} />;
                })}
            </svg>
        </div>
    );
}


