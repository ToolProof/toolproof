'use client';
import ResourceSVG from './ResourceSVG';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Point, Arrow, ResourceNameType, ArrowNameType, ArrowWithConfig } from './types';
import { useState, useRef, useEffect } from 'react';

interface LasagnaProps {
    z: number;
    showGlue: boolean;
}

export default function Lasagna({ z, showGlue }: LasagnaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [resourceText, setResourceText] = useState('');
    const [isBoxVisible, setIsBoxVisible] = useState(false);
    const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (resourceText) {
            setIsBoxVisible(true);
        }
    }, [resourceText]);

    const handleResourceClick = (text: string, x: number, y: number) => {
        setResourceText(text);
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
                {/* Draw Resources */}
                {Object.entries(resources).map(([key, resource]) => {
                    if (resource.nature === 'code_glue' && !showGlue) return null;
                    const color = resource.getFillColor();
                    return <ResourceSVG key={key} name={key as ResourceNameType} resource={resource} color={color} setResourceText={(text) => handleResourceClick(text as string, resource.cell.col * cellWidth, resource.cell.row * cellHeight)} />;
                })}
            </svg>
            {isBoxVisible && (
                // ATTENTION: temporary hack, use key instead
                <div style={{ position: 'absolute', top: boxPosition.top, left: boxPosition.left, backgroundColor: 'pink', padding: '10px', border: '1px solid black', zIndex: 10, borderRadius: '5px', width: (!resourceText.startsWith('Actionable') && !resourceText.startsWith('Glue')) ? '350px' : '250px', height: resourceText.startsWith('Humans') ? '100px' : '250px', overflowY: 'auto' }}>
                    <button onClick={() => setIsBoxVisible(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>✖</button>
                    <p>{resourceText}</p>
                </div>
            )}
        </div>
    );
}