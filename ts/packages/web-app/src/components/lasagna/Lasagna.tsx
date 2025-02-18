'use client';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Cell, ResourceNameType, ArrowNameType, ArrowWithConfig } from './types';
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

    const clearCanvas = () => {
      const context = getContext();
      if (!context) return;
      context.clearRect(0, 0, gridSize * cellWidth, gridSize * cellHeight);
    };

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
      // clearCanvas();
      // drawGrid();

      // Draw resources
      Object.entries(resources).forEach(([key, resource]) => {
        const color = sequence[z][0].includes(key as ResourceNameType) ? 'yellow' : 'black';
        resource.draw(context, color, showGlue);
        resource.drawText(context, key);
      });

      // Draw arrows


      const foo = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
        const isActive = sequence[z][0].includes(key as ArrowNameType)
        const color = isActive ? 'yellow' : 'black';
        if (arrowWithConfig.config.controlPoint) {
          arrowWithConfig.arrow.drawCurvy(context, arrowWithConfig.config.controlPoint, resources, color);
        } else {
          arrowWithConfig.arrow.draw(context, color, arrowWithConfig.config.shouldAdjust ?? false);
        }
        const nextKey = arrowWithConfig.config.next(z);
        if (nextKey) {
          const nextArrowWithConfig = arrowsWithConfig[nextKey];
          nextArrowWithConfig.config.drawInOrder(foo, nextKey, nextArrowWithConfig);
        }
      };

      const key = 'Human_Anchors';
      const genesisArrowWithConfig = arrowsWithConfig[key];
      genesisArrowWithConfig.config.drawInOrder(foo, key, genesisArrowWithConfig);

    }

    run();

  }, [z, showGlue]);

  return <canvas ref={canvasRef} />;

}
