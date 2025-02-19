'use client';
import { resources, arrowsWithConfig, sequence, gridSize, cellWidth, cellHeight } from './constants';
import { Cell, Resource, Arrow, ResourceNameType, ArrowNameType, ArrowWithConfig, DiamondPointType } from './types';
import React from 'react';

interface LasagnaProps {
  z: number;
  showGlue: boolean;
}

export default function Lasagna({ z, showGlue }: LasagnaProps) {
  // Get active elements for the current step
  const activeResources = Object.entries(resources).map(([key, resource]) => ({
    key,
    resource,
    isActive: sequence[z][0].includes(key as ResourceNameType),
  }));

  const arrowElements: JSX.Element[] = [];

  // Function to process arrows
  const processArrows = (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => {
    const isActive = sequence[z][0].includes(key as ArrowNameType);
    const color = isActive ? 'yellow' : 'black';

    // Store arrow JSX instead of drawing on canvas
    arrowElements.push(
      <ArrowComponent key={key} arrow={arrowWithConfig.arrow} color={color} controlPoint={arrowWithConfig.config.controlPoint} />
    );

    const nextKey = arrowWithConfig.config.next(z);
    if (nextKey) {
      const nextArrowWithConfig = arrowsWithConfig[nextKey];
      nextArrowWithConfig.config.drawInOrder(processArrows, nextKey, nextArrowWithConfig);
    }
  };

  // Start processing arrows
  const key = 'Human_Anchors';
  const genesisArrowWithConfig = arrowsWithConfig[key];
  genesisArrowWithConfig.config.drawInOrder(processArrows, key, genesisArrowWithConfig);

  return (
    <svg width={gridSize * cellWidth} height={gridSize * cellHeight} style={{ border: '1px solid black' }}>
      {/* Draw Grid */}
      {[...Array(gridSize)].map((_, col) =>
        [...Array(gridSize)].map((_, row) => (
          <rect
            key={`${col}-${row}`}
            x={col * cellWidth}
            y={row * cellHeight}
            width={cellWidth}
            height={cellHeight}
            stroke="gray"
            fill="none"
          />
        ))
      )}

      {/* Draw Resources */}
      {activeResources.map(({ key, resource, isActive }) => (
        <ResourceComponent key={key} resource={resource} isActive={isActive} showGlue={showGlue} />
      ))}

      {/* Draw Arrows */}
      {arrowElements}
    </svg>
  );
}



interface ResourceProps {
  resource: Resource;
  isActive: boolean;
  showGlue: boolean;
}


export function ResourceComponent({ resource, isActive, showGlue }: ResourceProps) {
  const { col, row, width, height } = resource.cell;
  const x = col * width;
  const y = row * height;

  const fillColor = isActive ? 'yellow' : resource.getFillColor();

  return (
    <>
      <rect x={x} y={y} width={width} height={height} fill={fillColor} stroke="black" />
      <text x={x + width / 2} y={y + height / 2} fontSize="16px" textAnchor="middle" fill="black">
        {resource.nature !== 'code_glue' ? resource.environment : ''}
      </text>
    </>
  );
}


interface ArrowProps {
  arrow: Arrow;
  color: string;
  controlPoint?: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType] | null;
}

export function ArrowComponent({ arrow, color, controlPoint }: ArrowProps) {
  const { startPoint, endPoint } = arrow;
  
  if (controlPoint) {
    // Get control point for curved arrows
    const control = Arrow.resolvePoint(controlPoint, resources);
    
    return (
      <>
        <path
          d={`M ${startPoint.x} ${startPoint.y} Q ${control.x} ${control.y} ${endPoint.x} ${endPoint.y}`}
          stroke="black"
          strokeWidth="4"
          fill="none"
        />
        <path
          d={`M ${startPoint.x} ${startPoint.y} Q ${control.x} ${control.y} ${endPoint.x} ${endPoint.y}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </>
    );
  }

  return (
    <>
      <line x1={startPoint.x} y1={startPoint.y} x2={endPoint.x} y2={endPoint.y} stroke="black" strokeWidth="4" />
      <line x1={startPoint.x} y1={startPoint.y} x2={endPoint.x} y2={endPoint.y} stroke={color} strokeWidth="2" />
    </>
  );
}
