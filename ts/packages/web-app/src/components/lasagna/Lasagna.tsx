'use client';
import { resources, arrows, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Cell } from './types';
import { useRef, useEffect } from 'react';

interface LasagnaProps {
  z: number;
}

export default function Lasagna({ z }: LasagnaProps) {
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
        resource.fill(context);
        const color = sequence[z][0] === key ? 'yellow' : 'black';
        resource.draw(context, color);
        resource.drawText(context, key);
      });

      // Draw arrows
      Object.entries(arrows).forEach(([key, arrow]) => {
        if (key !== 'Candidates_Simulation' && key !== 'Simulation_Results' && key !== 'Results_Agent' && key !== 'Agent_Agent') {
          const color = sequence[z + 1][0] === key ? 'yellow' : 'black';
          const keyFirst = key.split('_')[0];
          const keySecond = key.split('_')[1];
          const keyReverse = keySecond + '_' + keyFirst;
          const reverseIsActive = sequence[z + 1][0] === keyReverse;
          if (!reverseIsActive) {
            arrow.draw(context, color);
          }
        }
      });

      // Draw curvy arrows
      const color1 = sequence[z + 1][0] === 'Candidates_Simulation' ? 'yellow' : 'black';
      arrows['Candidates_Simulation'].drawCurvy(context, [new Cell(7, 3, cellWidth, cellHeight), 'top'], resources, cellWidth, cellHeight, color1);

      const color2 = sequence[z + 1][0] === 'Simulation_Results' ? 'yellow' : 'black';
      arrows['Simulation_Results'].drawCurvy(context, [new Cell(7, 6, cellWidth, cellHeight), 'top'], resources, cellWidth, cellHeight, color2);

      const color3 = sequence[z + 1][0] === 'Results_Agent' ? 'yellow' : 'black';
      arrows['Results_Agent'].drawCurvy(context, [new Cell(3, 6, cellWidth, cellHeight), 'bottom'], resources, cellWidth, cellHeight, color3);

    }

    run();

  }, [z]);

  return <canvas ref={canvasRef} />;

}
