

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
        public height: number,
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

    getExternalDiamond(): Diamond {
        return {
            top: { x: this.col * this.width + this.width / 2, y: this.row * this.height - this.height / 6 },
            bottom: { x: this.col * this.width + this.width / 2, y: (this.row + 1) * this.height + this.height / 6 },
            left: { x: this.col * this.width - this.width / 6, y: this.row * this.height + this.height / 2 },
            right: { x: (this.col + 1) * this.width + this.width / 6, y: this.row * this.height + this.height / 2 }
        };
    }

}


// ATTENTION: could be a more powerful type to allow for aliases
export type ResourceNameType =
    | 'Agent'
    | 'Human'
    | 'Tools'
    | 'Dummy0'
    | 'Dummy2'
    | 'Dummy5'
    | 'Dummy8'
    | 'Dummy10'
    | 'Dummy2B'
    | 'Dummy5B'
    | 'Dummy8B'


export type ArrowNameType =
    // | 'Tools_Human'
    // | 'Human_Tools'
    | 'Agent_Tools'
    | 'Tools_Agent'
    | 'Agent_Human'
    | 'Human_Agent'
    | 'Tools_Dummy2'
    | 'Dummy2_Tools'
    | 'Agent_Dummy5'
    | 'Dummy5_Agent'
    | 'Human_Dummy8'
    | 'Dummy8_Human'
    | 'Dummy0_Dummy2'
    | 'Dummy2_Dummy5'
    | 'Dummy5_Dummy8'
    | 'Dummy8_Dummy10'
    | 'Dummy2_Dummy2BA'
    | 'Dummy2_Dummy2BB'
    | 'Dummy5_Dummy5BA'
    | 'Dummy5_Dummy5BB'
    | 'Dummy8_Dummy8BA'
    | 'Dummy8_Dummy8BB'


export type GraphElementNameType = ResourceNameType | ArrowNameType;


export type Environment = 'lg' | 'vercel' | 'gcp';
export type Nature = 'code' | 'code_ai' | 'data' | 'data_meta' | 'dummy';


export class GraphElement {
    draw(context: CanvasRenderingContext2D, color: string, key?: GraphElementNameType, helperSwitch?: boolean) {
        // Placeholder method to be overridden by subclasses
        console.log('Drawing a graph element');
    }
}


export class Resource extends GraphElement {
    constructor(
        public cell: Cell,
        public environment: Environment,
        public nature: Nature,
        public isActive: boolean,
        public description: string
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

        const alpha = this.nature === 'data_meta' ? 1.0 : 1.0;
        return `rgba(${color}, ${alpha})`;
    }

    fill(context: CanvasRenderingContext2D, key: ResourceNameType, showAssistant: boolean) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust the radius as needed

        context.fillStyle = this.getFillColor();

        if (this.nature === 'data') {
            context.beginPath();
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
            context.fill();
        } else if (this.nature === 'data_meta') {
            if (true) {
                // Smaller centered ellipse
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + smallerWidth / 2; // Left-aligned
                const centeredY = y + this.cell.height / 2;
                context.beginPath();
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);
                context.fill();
            }
        } else if (this.nature === 'code') {
            context.fillRect(x, y, this.cell.width, this.cell.height);
        } else if (this.nature === 'code_ai' && key === 'Agent' && showAssistant) {
            context.beginPath();
            context.moveTo(x + this.cell.width / 2, y);
            context.lineTo(x + this.cell.width, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height);
            context.lineTo(x, y + this.cell.height / 2);
            context.closePath();
            context.fill();
        } else if (this.nature === 'code_ai') {
            context.beginPath();
            context.moveTo(x + this.cell.width / 2, y - this.cell.height / 6);
            context.lineTo(x + this.cell.width + this.cell.width / 6, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height + this.cell.height / 6);
            context.lineTo(x - this.cell.width / 6, y + this.cell.height / 2);
            context.closePath();
            context.fill();
        }
    }

    draw(context: CanvasRenderingContext2D, color: string, key: ResourceNameType, showAssistant: boolean) {
        if (!context) return;
        if (key.includes('Dummy')) {
            return null;
        }

        this.fill(context, key, showAssistant);

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
        } else if (this.nature === 'data_meta') {
            if (false) {
                // Smaller centered ellipse stroke
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + smallerWidth / 2; // Left-aligned
                const centeredY = y + this.cell.height / 2;
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);
            }
        } else if (this.nature === 'code') {
            // Full cell rectangle stroke
            context.rect(x, y, this.cell.width, this.cell.height);
        } else if (this.nature === 'code_ai' && key === 'Agent' && showAssistant) {
            return null;
            // Smaller diamond stroke
            context.moveTo(x + this.cell.width / 2, y);
            context.lineTo(x + this.cell.width, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height);
            context.lineTo(x, y + this.cell.height / 2);
            context.closePath();
        } else if (this.nature === 'code_ai') {
            // Diamond stroke
            context.moveTo(x + this.cell.width / 2, y - this.cell.height / 6);
            context.lineTo(x + this.cell.width + this.cell.width / 6, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height + this.cell.height / 6);
            context.lineTo(x - this.cell.width / 6, y + this.cell.height / 2);
            context.closePath();
        }

        context.stroke();
    }

    drawText(context: CanvasRenderingContext2D, key: string, showAssistant: boolean) {
        if (!context) return;
        if (key.includes('Dummy')) {
            return null;
        }

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        let displayText = key;
        if (key === 'InnerInput') {
            displayText = 'Inner Input';
        } else if (key === 'InnerOutput') {
            displayText = 'Inner Output';
        } else if (key === 'OuterInput') {
            displayText = 'Outer Input';
        } else if (key === 'OuterOutput') {
            displayText = 'Outer Output';
        } else if (key === 'InternalToolsLeft') {
            displayText = 'Tools';
        } else if (key === 'InternalToolsRight') {
            displayText = 'Tools';
        }
        /* if (displayText === 'Agent') {
            displayText = 'OpenAI o3';
        } else if (displayText === 'Tools') {
            displayText = false ? 'AutoDock' : 'Schrödinger';
        } */

        context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2);

        return;

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

}

export type CenterPointType = 'center';
export type CornerPointType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';
export type DiamondCornerPointType = 'topLeftD' | 'topRightD' | 'bottomLeftD' | 'bottomRightD';
export type ArrowPointType = CenterPointType | CornerPointType | DiamondPointType | DiamondCornerPointType;


export class Arrow extends GraphElement {
    public startPoint: Point;
    public endPoint: Point;
    private static cellWidth: number;
    private static cellHeight: number;

    constructor(
        startPointSpec: [ResourceNameType, ArrowPointType] | [Cell, ArrowPointType],
        endPointSpec: [ResourceNameType, ArrowPointType] | [Cell, ArrowPointType],
        resources: Record<ResourceNameType, Resource>,
        cellWidth: number,
        cellHeight: number,
    ) {
        super();
        Arrow.cellWidth = cellWidth;
        Arrow.cellHeight = cellHeight;
        this.startPoint = Arrow.resolvePoint(startPointSpec, resources);
        this.endPoint = Arrow.resolvePoint(endPointSpec, resources);
    }

    static resolvePoint(
        input: [ResourceNameType, ArrowPointType] | [Cell, ArrowPointType],
        resources: Record<ResourceNameType, Resource>
    ): Point {
        // Helper to adjust diamond points for resource-based inputs.
        function resolveDiamondPoint(resource: Resource, diamondKey: DiamondPointType): Point {
            const point = resource.cell.getOuterDiamond()[diamondKey];
            if (resource.nature === 'data') {
                if (diamondKey === 'top') {
                    return { x: point.x, y: point.y - (Arrow.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y + (Arrow.cellHeight / 6) };
                }
            } else if (resource.nature === 'code_ai') {
                if (diamondKey === 'left') {
                    return { x: point.x - (Arrow.cellWidth / 6), y: point.y };
                } else if (diamondKey === 'right') {
                    return { x: point.x + (Arrow.cellWidth / 6), y: point.y };
                } else if (diamondKey === 'top') {
                    return { x: point.x, y: point.y - (Arrow.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y + (Arrow.cellHeight / 6) };
                }
            } else if (resource.nature === 'dummy') {
                const smallerWidth = Arrow.cellWidth / 2;
                if (diamondKey === 'left') {
                    return { x: point.x + (smallerWidth / 2), y: point.y };
                } else if (diamondKey === 'right') {
                    return { x: point.x - (smallerWidth / 2), y: point.y };
                } else if (diamondKey === 'top') {
                    return { x: point.x, y: point.y + (Arrow.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y - (Arrow.cellHeight / 6) };
                }
            }
            return point;
        }

        const key = input[1];

        // New branch: if the key is 'center', return the cell's center.
        if (key === 'center') {
            if (typeof input[0] === 'string') {
                const resource = resources[input[0]];
                if (!resource) throw new Error(`Resource ${input[0]} not found.`);
                return resource.cell.getCenter();
            } else {
                return input[0].getCenter();
            }
        }

        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(key);
        const isDiamondCorner = ['topLeftD', 'topRightD', 'bottomLeftD', 'bottomRightD'].includes(key);

        if (typeof input[0] === 'string') {
            const resource = resources[input[0]];
            if (!resource) throw new Error(`Resource ${input[0]} not found.`);

            if (isCorner) {
                return resource.cell.getCorners()[key as CornerPointType];
            } else if (isDiamondCorner) {
                // For diamond-corner types, compute the average of two adjusted diamond points.
                const topPoint = resolveDiamondPoint(resource, 'top');
                const bottomPoint = resolveDiamondPoint(resource, 'bottom');
                const leftPoint = resolveDiamondPoint(resource, 'left');
                const rightPoint = resolveDiamondPoint(resource, 'right');
                switch (key) {
                    case 'topLeftD':
                        return { x: (topPoint.x + leftPoint.x) / 2, y: (topPoint.y + leftPoint.y) / 2 };
                    case 'topRightD':
                        return { x: (topPoint.x + rightPoint.x) / 2, y: (topPoint.y + rightPoint.y) / 2 };
                    case 'bottomLeftD':
                        return { x: (bottomPoint.x + leftPoint.x) / 2, y: (bottomPoint.y + leftPoint.y) / 2 };
                    case 'bottomRightD':
                        return { x: (bottomPoint.x + rightPoint.x) / 2, y: (bottomPoint.y + rightPoint.y) / 2 };
                }
            } else {
                // Diamond point type
                return resolveDiamondPoint(resource, key as DiamondPointType);
            }
        } else {
            // Cell-based input: no adjustments are applied.
            if (isCorner) {
                return input[0].getCorners()[key as CornerPointType];
            } else if (isDiamondCorner) {
                const diamond = input[0].getOuterDiamond();
                switch (key) {
                    case 'topLeftD':
                        return { x: (diamond.top.x + diamond.left.x) / 2, y: (diamond.top.y + diamond.left.y) / 2 };
                    case 'topRightD':
                        return { x: (diamond.top.x + diamond.right.x) / 2, y: (diamond.top.y + diamond.right.y) / 2 };
                    case 'bottomLeftD':
                        return { x: (diamond.bottom.x + diamond.left.x) / 2, y: (diamond.bottom.y + diamond.left.y) / 2 };
                    case 'bottomRightD':
                        return { x: (diamond.bottom.x + diamond.right.x) / 2, y: (diamond.bottom.y + diamond.right.y) / 2 };
                }
            } else {
                return input[0].getOuterDiamond()[key as DiamondPointType];
            }
        }
        return { x: 0, y: 0 }; // ATTENTION: hack to satisfy TypeScript
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
    next: (fn: () => boolean) => ArrowNameType | null;
}


export interface ArrowWithConfig {
    arrow: Arrow;
    config: ArrowConfig;
};