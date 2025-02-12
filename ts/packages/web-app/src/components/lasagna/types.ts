
export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';

export interface Diamond {
  top: Point;
  bottom: Point;
  left: Point;
  right: Point;
}

export interface ArrowPoints {
  startPoint: Point;
  endPoint: Point;
}

export interface ArrowPointsWithControlPoint extends ArrowPoints {
  controlPoint: Point;
}

export type Environment = 'lg' | 'vercel' | 'gcp';
export type Nature = 'code' | 'code_glue' | 'data';

export class Point {
  constructor(public x: number, public y: number) { }
}

export interface Cell {
  point: Point;
  environment: Environment;
  nature: Nature;
  isActive: boolean;
}

export type KeyType =
  | 'Agent'
  | 'Human'
  | 'Simulation'
  | 'Anchors'
  | 'AnchorsGlue'
  | 'Candidates'
  | 'CandidatesGlue'
  | 'Results'
  | 'ResultsGlue'
  | 'Papers'
  | 'PapersGlue';