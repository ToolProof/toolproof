'use client';
import { Arrow, CurvableArrow, Cell, Diamond, DiamondPointType, KeyType, Point, PointSpec, ArrowSpec, OrderableArrowSpec } from './types';
import { useState, useRef, useEffect } from 'react';


const cells: Record<KeyType, Cell> = {
  Agent: { point: new Point(3, 3), environment: 'lg', nature: 'code', isActive: true },
  Human: { point: new Point(3, 1), environment: 'vercel', nature: 'code', isActive: true },
  Simulation: { point: new Point(7, 5), environment: 'gcp', nature: 'code', isActive: true },
  Anchors: { point: new Point(1, 3), environment: 'gcp', nature: 'data', isActive: true },
  AnchorsGlue: { point: new Point(2, 3), environment: 'gcp', nature: 'code_glue', isActive: true },
  Candidates: { point: new Point(5, 3), environment: 'gcp', nature: 'data', isActive: true },
  CandidatesGlue: { point: new Point(4, 3), environment: 'gcp', nature: 'code_glue', isActive: true },
  Results: { point: new Point(5, 7), environment: 'gcp', nature: 'data', isActive: false },
  ResultsGlue: { point: new Point(3, 5), environment: 'gcp', nature: 'code_glue', isActive: false },
  Papers: { point: new Point(5, 1), environment: 'gcp', nature: 'data', isActive: true },
  PapersGlue: { point: new Point(4, 2), environment: 'gcp', nature: 'code_glue', isActive: true },
} as const;

function getColorForEnvironment(cell: Cell): string {
  let color: string;
  if (cell.environment === 'lg') {
    color = '255, 0, 0'; // red
  } else if (cell.environment === 'vercel') {
    color = '144, 238, 144'; // lightgreen
  } else if (cell.environment === 'gcp') {
    color = '173, 216, 230'; // lightblue
  } else {
    color = '0, 0, 0'; // black
  }

  const alpha = cell.nature === 'code_glue' ? 0.5 : 1.0;
  return `rgba(${color}, ${alpha})`;
}

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

    const fillCell = (cell: Cell) => {
      const context = getContext();
      if (!context) return;

      const x = cell.point.x * cellWidth;
      const y = cell.point.y * cellHeight;
      const radius = Math.min(cellWidth, cellHeight) / 2 + 10; // Adjust the radius as needed

      if (cell.nature === 'data') {
        context.beginPath();
        context.ellipse(x + cellWidth / 2, y + cellHeight / 2, cellWidth / 2, radius, 0, 0, 2 * Math.PI);
        context.fillStyle = getColorForEnvironment(cell);
        context.fill();
        context.stroke();
      } else if (cell.nature === 'code') {
        context.fillStyle = getColorForEnvironment(cell);
        context.fillRect(x, y, cellWidth, cellHeight);
        context.strokeRect(x, y, cellWidth, cellHeight);
      } else if (cell.nature === 'code_glue') {
        const quarterWidth = cellWidth / 4;
        const halfHeight = cellHeight / 2;
        const centeredX = x + (cellWidth - quarterWidth) / 2;
        const centeredY = y + (cellHeight - halfHeight) / 2;
        context.fillStyle = getColorForEnvironment(cell);
        context.fillRect(centeredX, centeredY, quarterWidth, halfHeight);
        context.strokeRect(centeredX, centeredY, quarterWidth, halfHeight);
      }
    };

    const setTextInCell = (key: string, cell: Cell) => {
      const context = getContext();
      if (!context) return;
      const x = cell.point.x * cellWidth;
      const y = cell.point.y * cellHeight;
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = 'black';
      let displayText = cell.nature === 'code_glue' ? '' : key;
      if (displayText === 'Simulation') {
        if (z) {
          displayText = 'AutoDock';
        } else {
          displayText = 'Schrödinger';
        }
      }
      context.fillText(displayText, x + cellWidth / 2, y + cellHeight / 2);

      let subText = '';
      if (cell.nature === 'code' && cell.environment === 'lg') {
        subText = 'LangGraph Platform';
      } else if (cell.nature === 'code' && cell.environment === 'vercel') {
        subText = 'Vercel';
      } else if (cell.nature === 'code' && cell.environment === 'gcp') {
        subText = 'GCP Cloud Run';
      } else if (cell.nature === 'data' && cell.environment === 'gcp') {
        subText = 'GCP Cloud Storage';
      }

      if (subText) {
        context.font = '10px Arial';
        context.fillText(subText, x + cellWidth / 2, y + cellHeight / 2 + 20);
      }
    }

    const strokeCellWithColor = (point: Point, color: string) => {
      const context = getContext();
      if (!context) return;

      const x = point.x * cellWidth;
      const y = point.y * cellHeight;

      context.strokeStyle = color;
      context.lineWidth = 5;
      context.strokeRect(x, y, cellWidth, cellHeight);
    };

    const strokeCurrentCell = () => {
      const cell = cells['Agent'];
      strokeCellWithColor(cell.point, 'yellow');
    };

    const drawCurvyArrow = (apwcp: CurvableArrow) => {
      const context = getContext();
      if (!context) return;

      const { x: startX, y: startY } = apwcp.startPoint;
      const { x: endX, y: endY } = apwcp.endPoint;
      const { x: controlX, y: controlY } = apwcp.controlPoint;

      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(startX, startY);
      context.bezierCurveTo(controlX, controlY, controlX, controlY, endX, endY);
      context.stroke();

      // Draw arrowhead
      const headlen = 15; // length of head in pixels
      const angle = Math.atan2(endY - controlY, endX - controlX);
      context.beginPath();
      context.moveTo(endX, endY);
      context.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
      context.moveTo(endX, endY);
      context.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
      context.stroke();
    };

    const getCellCorners = (point: Point) => {
      const topLeft = { x: point.x * cellWidth, y: point.y * cellHeight };
      const topRight = { x: (point.x + 1) * cellWidth, y: point.y * cellHeight };
      const bottomLeft = { x: point.x * cellWidth, y: (point.y + 1) * cellHeight };
      const bottomRight = { x: (point.x + 1) * cellWidth, y: (point.y + 1) * cellHeight };

      return { topLeft, topRight, bottomLeft, bottomRight };
    };


    const getArrowPoints = (cell1Key: KeyType, diamondPoint1: DiamondPointType, cell2Key: KeyType, diamondPoint2: DiamondPointType): Arrow => {
      const cell1 = cells[cell1Key];
      const cell2 = cells[cell2Key];

      const diamond1 = getOuterDiamond(cell1.point);
      const diamond2 = getOuterDiamond(cell2.point);

      return {
        startPoint: diamond1[diamondPoint1],
        endPoint: diamond2[diamondPoint2]
      };

    };

    const addControlPointForStraightLine = (arrowPoints: Arrow): CurvableArrow => {
      const x = (arrowPoints.startPoint.x + arrowPoints.endPoint.x) / 2;
      const y = (arrowPoints.startPoint.y + arrowPoints.endPoint.y) / 2;
      console.log('x:', x, 'y:', y);
      return {
        ...arrowPoints,
        controlPoint: new Point(x, y)
      };
    };

    const addControlPointForCurvyLine = (arrowPoints: Arrow): CurvableArrow => {
      const x = (arrowPoints.startPoint.x + arrowPoints.endPoint.x) / 2;
      const y = (arrowPoints.startPoint.y + arrowPoints.endPoint.y) / 2;
      return {
        ...arrowPoints,
        controlPoint: new Point(x, y)
      };
    };

    const foo = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = gridSize * cellWidth;
      canvas.height = gridSize * cellHeight;
      clearCanvas();
      // drawGrid();

      Object.entries(cells).forEach(([key, cell]) => {
        fillCell(cell);
        setTextInCell(key, cell);
      });

      // strokeCurrentCell();  

      if (true) {
        const cell = cells.Anchors;
        // strokeCellWithColor(cell.point.x, cell.point.y, 'green');
      }

      const Agent_Human: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'top'
          },
          endPointSpec: {
            cellKey: 'Human',
            diamondPoint: 'bottom'
          }
        },
        index: 0,
      };

      const Human_Agent: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Human',
            diamondPoint: 'bottom'
          },
          endPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'top'
          }
        },
        index: 1,
      };

      const Agent_Candidates: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'right'
          },
          endPointSpec: {
            cellKey: 'Candidates',
            diamondPoint: 'left'
          }
        },
        index: 2,
      };

      const Anchors_Agent: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Anchors',
            diamondPoint: 'right'
          },
          endPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'left'
          }
        },
        index: 3,
      };

      const Agent_Papers: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'right'
          },
          endPointSpec: {
            cellKey: 'Papers',
            diamondPoint: 'left'
          }
        },
        index: 4,
      };

      const Papers_Human: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Papers',
            diamondPoint: 'left'
          },
          endPointSpec: {
            cellKey: 'Human',
            diamondPoint: 'right'
          }
        },
        index: 5,
      };

      // Curvy arrows

      const Candidates_Simulation: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Candidates',
            diamondPoint: 'right'
          },
          endPointSpec: {
            cellKey: 'Simulation',
            diamondPoint: 'top'
          }
        },
        index: 6,
      };

      const Simulation_Results: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Simulation',
            diamondPoint: 'bottom'
          },
          endPointSpec: {
            cellKey: 'Results',
            diamondPoint: 'right'
          }
        },
        index: 7,
      };

      const Results_Agent: OrderableArrowSpec = {
        arrow: {
          startPointSpec: {
            cellKey: 'Results',
            diamondPoint: 'left'
          },
          endPointSpec: {
            cellKey: 'Agent',
            diamondPoint: 'bottom'
          }
        },
        index: 8,
      };
   

      const arrowPointsWithControlPoint1 = addControlPointForStraightLine(Agent_Human);
      const arrowPointsWithControlPoint2 = addControlPointForStraightLine(Human_Agent);
      const arrowPointsWithControlPoint3 = addControlPointForStraightLine(Agent_Candidates);
      const arrowPointsWithControlPoint4 = addControlPointForStraightLine(Anchors_Agent);
      const arrowPointsWithControlPoint5 = addControlPointForStraightLine(Agent_Papers);
      const arrowPointsWithControlPoint6 = addControlPointForStraightLine(Papers_Human);
      // Curvy arrows
      const arrowPointsWithControlPoint7 = {
        ...Candidates_Simulation,
        controlPoint: new Point(7 * cellWidth + cellWidth / 2, 3 * cellHeight + cellHeight / 2)
      }
      const arrowPointsWithControlPoint8 = {
        ...Simulation_Results,
        controlPoint: new Point(7 * cellWidth + cellWidth / 2, 7 * cellHeight + cellHeight / 2)
      }
      const arrowPointsWithControlPoint9 = {
        ...Results_Agent,
        controlPoint: new Point(3 * cellWidth + cellWidth / 2, 7 * cellHeight + cellHeight / 2)
      }


      drawCurvyArrow(arrowPointsWithControlPoint1);
      drawCurvyArrow(arrowPointsWithControlPoint2);
      drawCurvyArrow(arrowPointsWithControlPoint3);
      drawCurvyArrow(arrowPointsWithControlPoint4);
      drawCurvyArrow(arrowPointsWithControlPoint5);
      drawCurvyArrow(arrowPointsWithControlPoint6);
      // Curvy arrows
      drawCurvyArrow(arrowPointsWithControlPoint7);
      drawCurvyArrow(arrowPointsWithControlPoint8);
      drawCurvyArrow(arrowPointsWithControlPoint9);
    };

    /* setTimeout(() => {
      setZ(!z);
      foo();
    }, 10000); */

    foo();

  }, [z]);

  return <canvas ref={canvasRef} />;

}
