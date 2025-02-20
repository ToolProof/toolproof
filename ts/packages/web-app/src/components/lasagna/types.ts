import { cellHeight } from './constants';

// ATTENTION: could be a more powerful type to allow for aliases
export type ResourceNameType =
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
    | 'PapersGlue'
    | 'Checkpoints';


export type ArrowNameType =
    | 'Human_Anchors'
    | 'Agent_Candidates'
    | 'Candidates_Simulation'
    | 'Simulation_Results'
    | 'Results_Agent'
    | 'Agent_Anchors'
    | 'Anchors_Agent'
    | 'Agent_Human'
    | 'Human_Agent'
    | 'Agent_Papers'
    | 'Papers_Human'
    | 'Agent_Agent'
    | 'Agent_Checkpoints'
    | 'Checkpoints_Agent';


export type GraphElementNameType = ResourceNameType | ArrowNameType;


export class GraphElement {
    draw(context: CanvasRenderingContext2D, color: string, helperSwitch?: boolean) {
        // Placeholder method to be overridden by subclasses
        console.log('Drawing a graph element');
    }
}


export class Point {
    constructor(public x: number, public y: number) { }
}


export interface Corners {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
}


export interface Diamond {
    top: Point;
    bottom: Point;
    left: Point;
    right: Point;
}


export class Cell {
    constructor(
        public col: number,
        public row: number,
        public width: number,
        public height: number
    ) { }

    getCenter(): Point {
        return new Point(
            this.col * this.width + this.width / 2,
            this.row * this.height + this.height / 2
        );
    }

    getCorners(): Corners {
        return {
            topLeft: { x: this.col * this.width, y: this.row * this.height },
            topRight: { x: (this.col + 1) * this.width, y: this.row * this.height },
            bottomLeft: { x: this.col * this.width, y: (this.row + 1) * this.height },
            bottomRight: { x: (this.col + 1) * this.width, y: (this.row + 1) * this.height }
        };
    }

    getInnerDiamond(): Diamond {
        return {
            top: { x: this.col * this.width + this.width / 2, y: this.row * this.height + this.height * 0.15 },
            bottom: { x: this.col * this.width + this.width / 2, y: this.row * this.height + this.height * 0.85 },
            left: { x: this.col * this.width + this.width * 0.15, y: this.row * this.height + this.height / 2 },
            right: { x: this.col * this.width + this.width * 0.85, y: this.row * this.height + this.height / 2 }
        };
    }

    getOuterDiamond(): Diamond {
        return {
            top: { x: this.col * this.width + this.width / 2, y: this.row * this.height },
            bottom: { x: this.col * this.width + this.width / 2, y: (this.row + 1) * this.height },
            left: { x: this.col * this.width, y: this.row * this.height + this.height / 2 },
            right: { x: (this.col + 1) * this.width, y: this.row * this.height + this.height / 2 }
        };
    }
}


export type Environment = 'lg' | 'vercel' | 'gcp';
export type Nature = 'code' | 'code_glue' | 'data';


export class Resource extends GraphElement {
    constructor(
        public cell: Cell,
        public environment: Environment,
        public nature: Nature,
        public isActive: boolean
    ) {
        super();
    }

    getFillColor(): string {
        let color: string;
        if (this.environment === 'lg') {
            color = '255, 0, 0'; // red
        } else if (this.environment === 'vercel') {
            color = '144, 238, 144'; // lightgreen
        } else if (this.environment === 'gcp') {
            color = '173, 216, 230'; // lightblue
        } else {
            color = '0, 0, 0'; // black
        }

        const alpha = this.nature === 'code_glue' ? 0.5 : 1.0;
        return `rgba(${color}, ${alpha})`;
    }

    fill(context: CanvasRenderingContext2D, showGlue: boolean) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust the radius as needed

        context.fillStyle = this.getFillColor();

        if (this.nature === 'data') {
            context.beginPath();
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
            context.fill();
        } else if (this.nature === 'code') {
            context.fillRect(x, y, this.cell.width, this.cell.height);
        } else if (this.nature === 'code_glue') {
            if (showGlue) {

                const quarterWidth = this.cell.width / 4;
                const halfHeight = this.cell.height / 2;
                const centeredX = x + (this.cell.width - quarterWidth) / 2;
                const centeredY = y + (this.cell.height - halfHeight) / 2;
                context.fillRect(centeredX, centeredY, quarterWidth, halfHeight);
            }

        }
    }

    drawText(context: CanvasRenderingContext2D, key: string) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        let displayText = this.nature === 'code_glue' ? '' : key;
        if (displayText === 'Agent') {
            displayText = 'OpenAI o3';
        } else if (displayText === 'Simulation') {
            displayText = false ? 'AutoDock' : 'Schrödinger';
        }

        context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2);

        let subText = '';
        if (this.nature === 'code' && this.environment === 'lg') {
            subText = 'LangGraph Platform';
        } else if (this.nature === 'code' && this.environment === 'vercel') {
            subText = 'Vercel';
        } else if (this.nature === 'code' && this.environment === 'gcp') {
            subText = 'GCP Cloud Run';
        } else if (this.nature === 'data' && this.environment === 'gcp') {
            subText = 'GCP Cloud Storage';
        } else if (this.nature === 'data' && this.environment === 'lg') {
            subText = 'LangGraph Platform';
        }

        if (subText) {
            context.font = '10px Arial';
            context.fillText(subText, x + this.cell.width / 2, y + this.cell.height / 2 + 20);
        }
    }

    draw(context: CanvasRenderingContext2D, color: string, showGlue: boolean) {
        if (!context) return;

        this.fill(context, showGlue);

        const { col, row } = this.cell;
        const x = col * this.cell.width;
        const y = row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust radius for ellipse

        context.strokeStyle = color;
        context.lineWidth = 3; // Adjust as needed

        context.beginPath();

        if (this.nature === 'data') {
            // Ellipse stroke
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
        } else if (this.nature === 'code') {
            // Full cell rectangle stroke
            context.rect(x, y, this.cell.width, this.cell.height);
        } else if (this.nature === 'code_glue') {
            if (showGlue) {
                // Smaller centered rectangle stroke
                const quarterWidth = this.cell.width / 4;
                const halfHeight = this.cell.height / 2;
                const centeredX = x + (this.cell.width - quarterWidth) / 2;
                const centeredY = y + (this.cell.height - halfHeight) / 2;
                context.rect(centeredX, centeredY, quarterWidth, halfHeight);
            }
        }

        context.stroke();
    }
}


export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';



export class Arrow extends GraphElement {
    public startPoint: Point;
    public endPoint: Point;

    constructor(
        startPointSpec: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        endPointSpec: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>
    ) {
        super();
        this.startPoint = Arrow.resolvePoint(startPointSpec, resources);
        this.endPoint = Arrow.resolvePoint(endPointSpec, resources);
    }

    static resolvePoint(
        input: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>
    ): Point {
        if (typeof input[0] === 'string') { // ATTENTION: could use stricter type checking
            // Input is a ResourceNameType
            const resource = resources[input[0]];
            if (!resource) throw new Error(`Resource ${input[0]} not found.`);
            const point = resource.cell.getOuterDiamond()[input[1]];
            if (resource.nature === 'data') {
                // Adjust top/bottom point for ellipses
                if (input[1] === 'top') {
                    return { x: point.x, y: point.y - (cellHeight / 6) };
                } else if (input[1] === 'bottom') {
                    return { x: point.x, y: point.y + (cellHeight / 6) };
                }
            }
            return point;
        } else {
            // Input is a Cell
            return input[0].getOuterDiamond()[input[1]];
        }
    }

    draw(context: CanvasRenderingContext2D, color: string) {
        if (!context) return;

        // Draw black outline
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();

        // Draw colored line
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();

    }

    drawCurvy(
        context: CanvasRenderingContext2D,
        control: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>,
        color: string
    ) {
        if (!context) return;

        // Get control point
        const controlPoint = Arrow.resolvePoint(control, resources);

        // Draw the quadratic Bézier curve
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.quadraticCurveTo(controlPoint.x, controlPoint.y, this.endPoint.x, this.endPoint.y);
        context.stroke();

        // Draw colored line
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.quadraticCurveTo(controlPoint.x, controlPoint.y, this.endPoint.x, this.endPoint.y);
        context.stroke();

    }

    drawArrowhead(context: CanvasRenderingContext2D, start: Point, end: Point, color: string) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        this.drawArrowheadAtAngle(context, end, angle, color);
    }

    drawCurvyArrowhead(context: CanvasRenderingContext2D, start: Point, control: Point, end: Point, color: string) {
        // Compute tangent direction at endpoint of the quadratic Bézier curve
        const t = 1; // At the endpoint
        const dx = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
        const dy = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
        const angle = Math.atan2(dy, dx);

        this.drawArrowheadAtAngle(context, end, angle, color);
    }

    private drawArrowheadAtAngle(context: CanvasRenderingContext2D, position: Point, angle: number, color: string) {
        const arrowSize = 10;

        // Draw black outline
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(position.x, position.y);
        context.lineTo(
            position.x - arrowSize * Math.cos(angle - Math.PI / 6),
            position.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
            position.x - arrowSize * Math.cos(angle + Math.PI / 6),
            position.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.stroke();

        // Draw colored fill
        context.fillStyle = color;
        context.fill();
    }
}


export interface ArrowConfig {
    controlPoint: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType] | null;
    reverse: ArrowNameType | null;
    drawInOrder(fn: (key: ArrowNameType, arrowWithConfig: ArrowWithConfig) => void, key: ArrowNameType, arrowWithConfig: ArrowWithConfig,): void;
    next: (z: number) => ArrowNameType | null;
}


export interface ArrowWithConfig {
    arrow: Arrow;
    config: ArrowConfig;
};