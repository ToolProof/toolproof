'use client';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Arrow, Point, ResourceNameType, ArrowNameType, ArrowWithConfig } from './types';
import { useRef, useEffect } from 'react';

interface LasagnaProps {
  z: number;
  showGlue: boolean;
}

export default function Lasagna({ z, showGlue }: LasagnaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  useEffect(() => {

    const drawGrid = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize; row++) {
          context.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        }
      }
    };


    const run = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = gridSize * cellWidth;
      canvas.height = gridSize * cellHeight;

      // drawGrid();

      // Draw resources
      Object.entries(resources).forEach(([key, resource]) => {
        const color = sequence[z][0].includes(key as ResourceNameType) ? 'yellow' : 'black';
        resource.draw(context, color, showGlue);
        resource.drawText(context, key);
      });

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
    };

    run();

  }, [z, showGlue]);

  return <canvas ref={canvasRef} />;

}
