

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
    constructor(public col: number, public row: number) {
        this.col = col;
        this.row = row;
    }

    getCenter(width: number, height: number): Point {
        return new Point(
            this.col * width + width / 2,
            this.row * height + height / 2
        );
    }

    getCorners = (width: number, height: number): Corners => {
        const topLeft = { x: this.col * width, y: this.row * height };
        const topRight = { x: (this.col + 1) * width, y: this.row * height };
        const bottomLeft = { x: this.col * width, y: (this.row + 1) * height };
        const bottomRight = { x: (this.col + 1) * width, y: (this.row + 1) * height };

        return { topLeft, topRight, bottomLeft, bottomRight };
    };

    getInnerDiamond = (width: number, height: number): Diamond => {
        const top = { x: this.col * width + width / 2, y: this.row * height + height * 0.15 };
        const bottom = { x: this.col * width + width / 2, y: this.row * height + height * 0.85 };
        const left = { x: this.col * width + width * 0.15, y: this.row * height + height / 2 };
        const right = { x: this.col * width + width * 0.85, y: this.row * height + height / 2 };

        return { top, bottom, left, right };
    };

    getOuterDiamond = (width: number, height: number): Diamond => {
        const top = { x: this.col * width + width / 2, y: this.row * height };
        const bottom = { x: this.col * width + width / 2, y: (this.row + 1) * height };
        const left = { x: this.col * width, y: this.row * height + height / 2 };
        const right = { x: (this.col + 1) * width, y: this.row * height + height / 2 };

        return { top, bottom, left, right };
    };


}


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
    | 'PapersGlue';


export type Environment = 'lg' | 'vercel' | 'gcp';
export type Nature = 'code' | 'code_glue' | 'data';


export class Resource {
    constructor(
        public cell: Cell,
        public environment: Environment,
        public nature: Nature,
        public isActive: boolean
    ) { }

    getColor(): string {
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

    draw(context: CanvasRenderingContext2D, cellWidth: number, cellHeight: number) {
        if (!context) return;

        const x = this.cell.col * cellWidth;
        const y = this.cell.row * cellHeight;
        const radius = Math.min(cellWidth, cellHeight) / 2 + 10; // Adjust the radius as needed

        context.fillStyle = this.getColor();

        if (this.nature === 'data') {
            context.beginPath();
            context.ellipse(x + cellWidth / 2, y + cellHeight / 2, cellWidth / 2, radius, 0, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
        } else if (this.nature === 'code') {
            context.fillRect(x, y, cellWidth, cellHeight);
            context.strokeRect(x, y, cellWidth, cellHeight);
        } else if (this.nature === 'code_glue') {
            const quarterWidth = cellWidth / 4;
            const halfHeight = cellHeight / 2;
            const centeredX = x + (cellWidth - quarterWidth) / 2;
            const centeredY = y + (cellHeight - halfHeight) / 2;
            context.fillRect(centeredX, centeredY, quarterWidth, halfHeight);
            context.strokeRect(centeredX, centeredY, quarterWidth, halfHeight);
        }
    }

    drawText(context: CanvasRenderingContext2D, key: string, cellWidth: number, cellHeight: number, z: boolean) {
        if (!context) return;

        const x = this.cell.col * cellWidth;
        const y = this.cell.row * cellHeight;
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        let displayText = this.nature === 'code_glue' ? '' : key;
        if (displayText === 'Simulation') {
            displayText = z ? 'AutoDock' : 'Schrödinger';
        }

        context.fillText(displayText, x + cellWidth / 2, y + cellHeight / 2);

        let subText = '';
        if (this.nature === 'code' && this.environment === 'lg') {
            subText = 'LangGraph Platform';
        } else if (this.nature === 'code' && this.environment === 'vercel') {
            subText = 'Vercel';
        } else if (this.nature === 'code' && this.environment === 'gcp') {
            subText = 'GCP Cloud Run';
        } else if (this.nature === 'data' && this.environment === 'gcp') {
            subText = 'GCP Cloud Storage';
        }

        if (subText) {
            context.font = '10px Arial';
            context.fillText(subText, x + cellWidth / 2, y + cellHeight / 2 + 20);
        }
    }

    stroke(context: CanvasRenderingContext2D, cellWidth: number, cellHeight: number, color: string) {
        if (!context) return;

        const { col, row } = this.cell;
        const x = col * cellWidth;
        const y = row * cellHeight;
        const radius = Math.min(cellWidth, cellHeight) / 2 + 10; // Adjust radius for ellipse

        context.strokeStyle = color;
        context.lineWidth = 2; // Adjust as needed

        context.beginPath();

        if (this.nature === 'data') {
            // Ellipse stroke
            context.ellipse(x + cellWidth / 2, y + cellHeight / 2, cellWidth / 2, radius, 0, 0, 2 * Math.PI);
        } else if (this.nature === 'code') {
            // Full cell rectangle stroke
            context.rect(x, y, cellWidth, cellHeight);
        } else if (this.nature === 'code_glue') {
            // Smaller centered rectangle stroke
            const quarterWidth = cellWidth / 4;
            const halfHeight = cellHeight / 2;
            const centeredX = x + (cellWidth - quarterWidth) / 2;
            const centeredY = y + (cellHeight - halfHeight) / 2;
            context.rect(centeredX, centeredY, quarterWidth, halfHeight);
        }

        context.stroke();
    }
}


export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';

export class Arrow {
    public startPoint: Point;
    public endPoint: Point;

    constructor(
        start: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        end: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>,
        cellWidth: number,
        cellHeight: number
    ) {
        this.startPoint = Arrow.resolvePoint(start, resources, cellWidth, cellHeight);
        this.endPoint = Arrow.resolvePoint(end, resources, cellWidth, cellHeight);
    }

    private static resolvePoint(
        input: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>,
        cellWidth: number,
        cellHeight: number
    ): Point {
        if (typeof input[0] === 'string') {
            // Input is a ResourceNameType
            const resource = resources[input[0]];
            if (!resource) throw new Error(`Resource ${input[0]} not found.`);
            return resource.cell.getOuterDiamond(cellWidth, cellHeight)[input[1]];
        } else {
            // Input is a Cell
            return input[0].getOuterDiamond(cellWidth, cellHeight)[input[1]];
        }
    }

    draw(context: CanvasRenderingContext2D) {
        if (!context) return;

        context.strokeStyle = 'black';
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();

        this.drawArrowhead(context, this.startPoint, this.endPoint);
    }

    drawCurvy(
        context: CanvasRenderingContext2D,
        control: [ResourceNameType, DiamondPointType] | [Cell, DiamondPointType],
        resources: Record<ResourceNameType, Resource>,
        cellWidth: number,
        cellHeight: number
    ) {
        if (!context) return;

        // Get control point
        const controlPoint = Arrow.resolvePoint(control, resources, cellWidth, cellHeight);

        // Draw the quadratic Bézier curve
        context.strokeStyle = 'black';
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.quadraticCurveTo(controlPoint.x, controlPoint.y, this.endPoint.x, this.endPoint.y);
        context.stroke();

        this.drawCurvedArrowhead(context, this.startPoint, controlPoint, this.endPoint);
    }

    private drawArrowhead(context: CanvasRenderingContext2D, start: Point, end: Point) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        this.drawArrowheadAtAngle(context, end, angle);
    }

    private drawCurvedArrowhead(context: CanvasRenderingContext2D, start: Point, control: Point, end: Point) {
        // Compute tangent direction at endpoint of the quadratic Bézier curve
        const t = 1; // At the endpoint
        const dx = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
        const dy = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
        const angle = Math.atan2(dy, dx);

        this.drawArrowheadAtAngle(context, end, angle);
    }

    private drawArrowheadAtAngle(context: CanvasRenderingContext2D, position: Point, angle: number) {
        const arrowSize = 10;

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
        context.fill();
    }
}
