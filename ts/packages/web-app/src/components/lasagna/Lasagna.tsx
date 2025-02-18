'use client';
import { resources, arrows, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Cell, ResourceNameType } from './types';
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
      drawGrid();

      // Draw resources
      Object.entries(resources).forEach(([key, resource]) => {
        const color = sequence[z][0].includes(key as ResourceNameType) ? 'yellow' : 'black';
        resource.draw(context, color, showGlue);
        resource.drawText(context, key);
      });

      // Draw arrows
      const color0 = sequence[z][0].includes('Human_Anchors') ? 'yellow' : 'black';
      arrows['Human_Anchors'].drawCurvy(context, [new Cell(0, 7, cellWidth, cellHeight), 'left'], resources, color0);

      const color1 = sequence[z][0].includes('Agent_Anchors') ? 'yellow' : 'black';
      const reverseIsActive1 = sequence[z][0].includes('Anchors_Agent');
      if (!reverseIsActive1) {
        arrows['Agent_Anchors'].drawCurvy(context, [new Cell(2, 5, cellWidth, cellHeight), 'top'], resources, color1);
      };

      const color2 = sequence[z][0].includes('Anchors_Agent') ? 'yellow' : 'black';
      const reverseIsActive2 = sequence[z][0].includes('Agent_Anchors');
      if (!reverseIsActive2) {
        arrows['Anchors_Agent'].drawCurvy(context, [new Cell(2, 5, cellWidth, cellHeight), 'top'], resources, color2);
      };

      const color3 = sequence[z][0].includes('Agent_Candidates') ? 'yellow' : 'black';
      arrows['Agent_Candidates'].drawCurvy(context, [new Cell(4, 3, cellWidth, cellHeight), 'bottom'], resources, color3);

      const color4 = sequence[z][0].includes('Candidates_Simulation') ? 'yellow' : 'black';
      const color5 = sequence[z][0].includes('Simulation_Results') ? 'yellow' : 'black';

      if (color4 === 'yellow') {
        arrows['Simulation_Results'].drawCurvy(context, [new Cell(5, 1, cellWidth, cellHeight), 'bottom'], resources, color5);

        arrows['Candidates_Simulation'].drawCurvy(context, [new Cell(5, 1, cellWidth, cellHeight), 'bottom'], resources, color4);

      } else {
        arrows['Candidates_Simulation'].drawCurvy(context, [new Cell(5, 1, cellWidth, cellHeight), 'bottom'], resources, color4);

        arrows['Simulation_Results'].drawCurvy(context, [new Cell(5, 1, cellWidth, cellHeight), 'bottom'], resources, color5);
      }

      const color6 = sequence[z][0].includes('Results_Agent') ? 'yellow' : 'black';
      arrows['Results_Agent'].drawCurvy(context, [new Cell(6, 3, cellWidth, cellHeight), 'bottom'], resources, color6);

      const color7 = sequence[z][0].includes('Agent_Papers') ? 'yellow' : 'black';
      arrows['Agent_Papers'].drawCurvy(context, [new Cell(8, 3, cellWidth, cellHeight), 'bottom'], resources, color7);

      const color8 = sequence[z][0].includes('Agent_Human') ? 'yellow' : 'black';
      const reverseIsActive8 = sequence[z][0].includes('Human_Agent');
      if (!reverseIsActive8 || true) {
        arrows['Agent_Human'].draw(context, color8, false);
      };

      const color9 = sequence[z][0].includes('Human_Agent') ? 'yellow' : 'black';
      const reverseIsActive9 = sequence[z][0].includes('Agent_Human');
      if (!reverseIsActive9 || true) {
        arrows['Human_Agent'].draw(context, color9, true);
      };

      const color10 = sequence[z][0].includes('Papers_Human') ? 'yellow' : 'black';
      arrows['Papers_Human'].drawCurvy(context, [new Cell(10, 7, cellWidth, cellHeight), 'bottom'], resources, color10);

      const color11 = sequence[z][0].includes('Checkpoints_Agent') ? 'yellow' : 'black';
      const reverseIsActive11 = sequence[z][0].includes('Agent_Checkpoints');
      if (!reverseIsActive11 || true) {
        arrows['Checkpoints_Agent'].draw(context, color11, false);
      };

      const color12 = sequence[z][0].includes('Agent_Checkpoints') ? 'yellow' : 'black';
      const reverseIsActive12 = sequence[z][0].includes('Checkpoints_Agent');
      if (!reverseIsActive12 || true) {
        arrows['Agent_Checkpoints'].draw(context, color12, true);
      };
      
    }

    run();

  }, [z, showGlue]);

  return <canvas ref={canvasRef} />;

}
