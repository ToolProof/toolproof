'use client';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Point, Resource, Arrow, ResourceNameType, ArrowNameType, ArrowWithConfig } from './types';
import { useRef, useEffect } from 'react';

interface LasagnaProps {
    z: number;
    showGlue: boolean;
}

export default function Lasagna({ z, showGlue }: LasagnaProps) {
    // Compute the list of elements to render in SVG
    const activeResources = sequence[z][0] as ResourceNameType[];
    const activeArrows = sequence[z][0] as ArrowNameType[];
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getContext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.getContext('2d');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const foo = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
            const isActive = sequence[z][0].includes(key as ArrowNameType);
            const color = isActive ? 'yellow' : 'black';

            if (arrowWithConfig.config.controlPoint) {
                // Draw curved arrow line
                arrowWithConfig.arrow.drawCurvy(
                    context,
                    arrowWithConfig.config.controlPoint,
                    resources,
                    color,
                    arrowWithConfig.config.shouldAdjust ?? false
                );
                // Store arrowhead for later
                if (isActive) {
                    const controlPoint = Arrow.resolvePoint(arrowWithConfig.config.controlPoint, resources);
                    arrowheadQueue.push({ start: arrowWithConfig.arrow.startPoint, end: arrowWithConfig.arrow.endPoint, color, isCurvy: true, control: controlPoint });
                }
            } else {
                // Draw straight arrow line
                arrowWithConfig.arrow.draw(context, color, arrowWithConfig.config.shouldAdjust ?? false);
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
            // return;
            if (isCurvy && control) {
                Arrow.prototype.drawCurvedArrowhead(context, start, control, end, color);
            } else {
                Arrow.prototype.drawArrowhead(context, start, end, color);
            }
        });

    }, [z]);

    return (
        
        <svg width={gridSize * cellWidth} height={gridSize * cellHeight} style={{ border: '1px solid black' }}>
            {/* Grid */}
            {Array.from({ length: gridSize }).map((_, col) =>
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
            )}

            {/* Draw Resources */}
            {Object.entries(resources).map(([key, resource]) => {
                const color = resource.getFillColor();
                return <ResourceSVG key={key} name={key as ResourceNameType} resource={resource} color={color} showGlue={showGlue} />;
            })}

            {/* Draw Arrows */}
            {/* {Object.entries(arrowsWithConfig).map(([key, arrowWithConfig]) => {
                const isActive = activeArrows.includes(key as ArrowNameType);
                const color = isActive ? 'yellow' : 'black';

                return (
                    <ArrowSVG
                        key={key}
                        arrowWithConfig={arrowWithConfig}
                        color={color}
                        z={z}
                    />
                );
            })} */}
        </svg>
    );
}


interface ResourceSVGProps {
    name: ResourceNameType;
    resource: Resource;
    color: string;
    showGlue: boolean;
}

const ResourceSVG: React.FC<ResourceSVGProps> = ({ name, resource, color, showGlue }) => {
    const { col, row, width, height } = resource.cell;
    const x = col * width;
    const y = row * height;

    return (
        <>
            {resource.nature === 'data' ? (
                <ellipse
                    cx={x + width / 2}
                    cy={y + height / 2}
                    rx={width / 2}
                    ry={height / 2 + 10}
                    fill={color}
                    stroke="black"
                />
            ) : (
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    stroke="black"
                />
            )}

            {/* Resource Label */}
            <text
                x={x + width / 2}
                y={y + height / 2}
                fontSize="16px"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="black"
            >
                {name}
            </text>
        </>
    );
};



interface ArrowSVGProps {
    arrowWithConfig: ArrowWithConfig;
    color: string;
    z: number;
}

const ArrowSVG: React.FC<ArrowSVGProps> = ({ arrowWithConfig, color }) => {
    const { arrow, config } = arrowWithConfig;
    const { startPoint, endPoint } = arrow;

    if (config.controlPoint) {
        // Curved Arrow (Quadratic Bézier)
        const control = Arrow.resolvePoint(config.controlPoint, resources);
        return (
            <path
                d={`M ${startPoint.x} ${startPoint.y} Q ${control.x} ${control.y}, ${endPoint.x} ${endPoint.y}`}
                stroke={color}
                fill="transparent"
                strokeWidth="2"
            />
        );
    } else {
        // Straight Arrow
        return (
            <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke={color}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
            />
        );
    }
};
