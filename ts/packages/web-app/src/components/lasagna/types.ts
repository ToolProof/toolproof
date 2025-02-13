
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

export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';

export interface Diamond {
    top: Point;
    bottom: Point;
    left: Point;
    right: Point;
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


export interface PointSpec {
    cellKey: KeyType;
    diamondPoint: DiamondPointType;
}

export interface ArrowSpec {
    startPointSpec: PointSpec;
    endPointSpec: PointSpec;
}

const getInnerDiamond = (point: Point): Diamond => {
    const top = { x: point.x * cellWidth + cellWidth / 2, y: point.y * cellHeight + cellHeight * 0.15 };
    const bottom = { x: point.x * cellWidth + cellWidth / 2, y: point.y * cellHeight + cellHeight * 0.85 };
    const left = { x: point.x * cellWidth + cellWidth * 0.15, y: point.y * cellHeight + cellHeight / 2 };
    const right = { x: point.x * cellWidth + cellWidth * 0.85, y: point.y * cellHeight + cellHeight / 2 };

    return { top, bottom, left, right };
};

const getOuterDiamond = (point: Point): Diamond => {
    const top = { x: point.x * cellWidth + cellWidth / 2, y: point.y * cellHeight };
    const bottom = { x: point.x * cellWidth + cellWidth / 2, y: (point.y + 1) * cellHeight };
    const left = { x: point.x * cellWidth, y: point.y * cellHeight + cellHeight / 2 };
    const right = { x: (point.x + 1) * cellWidth, y: point.y * cellHeight + cellHeight / 2 };

    return { top, bottom, left, right };
};


export class Arrow {
    constructor(public startPoint: Point, public endPoint: Point) { }

    static fromSpec(spec: ArrowSpec, cellMap: Map<KeyType, Cell>): Arrow {
        const cell1 = cellMap.get(spec.startPointSpec.cellKey);
        const cell2 = cellMap.get(spec.endPointSpec.cellKey);

        const diamond1 = getInnerDiamond(cell1.point);
        const diamond2 = getOuterDiamond(cell2.point);



        const startPoint = cellMap.get(spec.startPointSpec.cellKey);
        const endPoint = cellMap.get(spec.endPointSpec.cellKey);

        if (!startPoint || !endPoint) {
            throw new Error('Invalid cell keys in ArrowSpec');
        }

        return new Arrow(
            startPoint.point,
            endPoint.point
        );
    }
}

export interface Orderable {
    index: number;
}

export interface OrderableArrowSpec {
    arrow: ArrowSpec;
    index: number;
}

export interface CurvableArrow extends Arrow {
    controlPoint: Point;
}

export interface OrderableCurvableArrow extends CurvableArrow {
    index: number;
}
