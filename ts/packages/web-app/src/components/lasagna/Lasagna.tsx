'use client';
import { ResourceNameType, Resource, Cell, Arrow } from './types';
import { useState, useRef, useEffect } from 'react';


const resources: Record<ResourceNameType, Resource> = {
  Agent: new Resource(new Cell(3, 3), 'lg', 'code', true),
  Human: new Resource(new Cell(3, 1), 'vercel', 'code', true),
  Simulation: new Resource(new Cell(7, 5), 'gcp', 'code', true),
  Anchors: new Resource(new Cell(1, 3), 'gcp', 'data', true),
  AnchorsGlue: new Resource(new Cell(2, 3), 'gcp', 'code_glue', true),
  Candidates: new Resource(new Cell(5, 3), 'gcp', 'data', true),
  CandidatesGlue: new Resource(new Cell(4, 3), 'gcp', 'code_glue', true),
  Results: new Resource(new Cell(5, 7), 'gcp', 'data', false),
  ResultsGlue: new Resource(new Cell(3, 5), 'gcp', 'code_glue', false),
  Papers: new Resource(new Cell(5, 1), 'gcp', 'data', true),
  PapersGlue: new Resource(new Cell(4, 2), 'gcp', 'code_glue', true),
} as const;


export default function Lasagna() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [z, setZ] = useState(false);

  const gridSize = 10;
  const cellWidth = 140;
  const cellHeight = 70;

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

    const foo = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = gridSize * cellWidth;
      canvas.height = gridSize * cellHeight;
      clearCanvas();
      // drawGrid();

      Object.entries(resources).forEach(([key, resource]) => {
        resource.draw(context, cellWidth, cellHeight);
        // resource.stroke(context, cellWidth, cellHeight, 'yellow');
        resource.drawText(context, key, cellWidth, cellHeight, z);
      });


      // Arrows

      const Human_Candidates = new Arrow(['Agent', 'right'], ['Candidates', 'left'], resources, cellWidth, cellHeight);
      Human_Candidates.draw(context);

      const Candidates_Simulation = new Arrow(['Candidates', 'right'], ['Simulation', 'top'], resources, cellWidth, cellHeight);
      Candidates_Simulation.drawCurvy(context, [new Cell(7, 3), 'bottom'], resources, cellWidth, cellHeight);

      const Simulation_Results = new Arrow(['Simulation', 'bottom'], ['Results', 'right'], resources, cellWidth, cellHeight);
      Simulation_Results.drawCurvy(context, [new Cell(7, 7), 'top'], resources, cellWidth, cellHeight);

      const Results_Agent = new Arrow(['Results', 'left'], ['Agent', 'bottom'], resources, cellWidth, cellHeight);
      Results_Agent.drawCurvy(context, [new Cell(3, 6), 'bottom'], resources, cellWidth, cellHeight);

    }

    /* setTimeout(() => {
      setZ(!z);
      foo();
    }, 1000); */

    foo();

  }, [z]);

  return <canvas ref={canvasRef} />;

}
