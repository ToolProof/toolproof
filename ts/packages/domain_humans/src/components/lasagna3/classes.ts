// import { pathDescriptions } from './texts/textsEng';

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


export class GraphElement {
    draw(context: CanvasRenderingContext2D, color: string, key?: string, helperSwitch?: boolean) {
        // Placeholder method to be overridden by subclasses
        console.log('Drawing a graph element');
    }
}

export const natureTypes = ['code', 'data'];
export const environmentTypes = ['lgp', 'gcp'];

export const diamondPointTypes = ['top', 'bottom', 'left', 'right']; // ATTENTION: must be single source of truth

export type Nature = typeof natureTypes[number];
export type Environment = typeof environmentTypes[number];

export class Node extends GraphElement {
    constructor(
        public cell: Cell,
        public name: string,
        public nature: Nature,
        public environment: Environment,
    ) {
        super();
    }

    getFillColor(key: string): string {
        let color: string;
        if (this.environment === 'lgp') {
            color = '255, 0, 0'; // red
        } else if (this.environment === 'vercel') {
            color = '144, 238, 144'; // lightgreen
        } else if (this.environment === 'gcp') {
            color = '173, 216, 230'; // lightblue
        } else {
            color = '0, 0, 0'; // black
        }

        const alpha = (key === 'PreviousNode' || key === 'NextNode') ? 0.3 : 1.0;
        return `rgba(${color}, ${alpha})`;
    }

    fill(context: CanvasRenderingContext2D, key: string, showStandin: boolean) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust the radius as needed

        context.fillStyle = this.getFillColor(key);

        if (this.nature === 'data') {
            context.beginPath();
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
            context.fill();
        } else if (this.nature === 'data_meta') {
            if (key === 'Meta') {
                // Smaller centered ellipse
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + smallerWidth / 2; // Left-aligned
                const centeredY = y + this.cell.height / 2;
                context.beginPath();
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);
                context.fill();
            } else if (key === 'MetaInternal') {
                // Smaller centered ellipse
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + this.cell.width - smallerWidth / 2; // Right-aligned
                const centeredY = y + this.cell.height / 2;
                context.beginPath();
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);
                context.fill();
            }
        } else if ((this.nature === 'code_ai')) {
            context.beginPath();
            context.moveTo(x + this.cell.width / 2, y - this.cell.height / 6);
            context.lineTo(x + this.cell.width + this.cell.width / 6, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height + this.cell.height / 6);
            context.lineTo(x - this.cell.width / 6, y + this.cell.height / 2);
            context.closePath();
            context.fill();
        } else if (this.nature === 'code') {
            context.fillRect(x, y, this.cell.width, this.cell.height);
        }
    }

    draw(context: CanvasRenderingContext2D, color: string, key: string, showStandin: boolean) {
        if (!context) return;
        /* if (key.includes('Dummy')) {
            return null;
        } */

        this.fill(context, key, showStandin);

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
            if (key === 'Meta') {
                // Smaller centered ellipse stroke
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + smallerWidth / 2; // Left-aligned
                const centeredY = y + this.cell.height / 2;
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);
            } else if (key === 'MetaInternal') {
                // Smaller centered ellipse stroke
                const smallerWidth = this.cell.width / 2;
                const smallerHeight = this.cell.height / 1.5;
                const centeredX = x + this.cell.width - smallerWidth / 2; // Right-aligned
                const centeredY = y + this.cell.height / 2;
                context.ellipse(centeredX, centeredY, smallerWidth / 2, smallerHeight / 2, 0, 0, 2 * Math.PI);

                context.lineWidth = 1;
                context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            }
        } else if ((this.nature === 'code_ai')) {
            // Diamond stroke
            context.moveTo(x + this.cell.width / 2, y - this.cell.height / 6);
            context.lineTo(x + this.cell.width + this.cell.width / 6, y + this.cell.height / 2);
            context.lineTo(x + this.cell.width / 2, y + this.cell.height + this.cell.height / 6);
            context.lineTo(x - this.cell.width / 6, y + this.cell.height / 2);
            context.closePath();
        } else if (this.nature === 'code') {
            // Full cell rectangle stroke
            context.rect(x, y, this.cell.width, this.cell.height);
        }

        context.stroke();
    }

    drawText(context: CanvasRenderingContext2D, key: string, counter: number) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        let displayText = key;
        if (key === 'Node') {
            displayText = ''; //pathDescriptions[counter].NodeText;
            context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2);
        } else if (key === 'Graph') {
            context.font = '14px Arial';
            displayText = ''; //pathDescriptions[counter].GraphName;
            context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2 - 14);
        } else {
            context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2);
        }


        // return;
        // console.log('counter', counter);

        let subText = '';
        const pathDescription = ''; //pathDescriptions[counter];
        if (key === 'Node') {
            subText = '';
        } else if (key === 'GraphState') {
            subText = ''; //pathDescription.GraphStateText;
        } else if (key === 'FileStorage') {
            subText = ''; //pathDescription.FileStorageText;
        } else if (key === 'Tool') {
            subText = '';
        }

        if (subText) {
            context.font = '11px Arial';
            context.fillText(subText, x + this.cell.width / 2, y + this.cell.height / 2 + 14);
        }
    }

}

export type CenterPointType = 'center';
export type CornerPointType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type DiamondPointType = 'top' | 'bottom' | 'left' | 'right';
export type DiamondCornerPointType = 'topLeftD' | 'topRightD' | 'bottomLeftD' | 'bottomRightD';
export type EdgePointType = CenterPointType | CornerPointType | DiamondPointType | DiamondCornerPointType;


export class Edge extends GraphElement {
    public startPoint: Point;
    public endPoint: Point;
    public static cellWidth: number;
    public static cellHeight: number;

    constructor(
        startPointSpec: [string, EdgePointType] | [Cell, EdgePointType],
        endPointSpec: [string, EdgePointType] | [Cell, EdgePointType],
        // Change from a keyed object to an array of nodes
        nodes: Node[],
        cellWidth: number,
        cellHeight: number,
        controlPoint: [string, DiamondPointType] | [Cell, DiamondPointType] | null,
        reverse: string | null,
    ) {
        super();
        Edge.cellWidth = cellWidth;
        Edge.cellHeight = cellHeight;
        this.startPoint = Edge.resolvePoint(startPointSpec, nodes);
        this.endPoint = Edge.resolvePoint(endPointSpec, nodes);
    }

    static resolvePoint(
        input: [string, EdgePointType] | [Cell, EdgePointType],
        // Update the type here as well
        nodes: Node[]
    ): Point {
        let result: Point = { x: 0, y: 0 }; // Default placeholder value

        function resolveDiamondPoint(node: Node, diamondKey: DiamondPointType): Point {
            const point = node.cell.getOuterDiamond()[diamondKey];
            if (node.nature === 'data') {
                if (diamondKey === 'top') {
                    return { x: point.x, y: point.y - (Edge.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y + (Edge.cellHeight / 6) };
                }
            } else if (node.nature === 'code_ai') {
                if (diamondKey === 'left') {
                    return { x: point.x - (Edge.cellWidth / 6), y: point.y };
                } else if (diamondKey === 'right') {
                    return { x: point.x + (Edge.cellWidth / 6), y: point.y };
                } else if (diamondKey === 'top') {
                    return { x: point.x, y: point.y - (Edge.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y + (Edge.cellHeight / 6) };
                }
            } else if (node.nature === 'dummy') {
                const smallerWidth = Edge.cellWidth / 2;
                if (diamondKey === 'left') {
                    return { x: point.x + (smallerWidth / 2), y: point.y };
                } else if (diamondKey === 'right') {
                    return { x: point.x - (smallerWidth / 2), y: point.y };
                } else if (diamondKey === 'top') {
                    return { x: point.x, y: point.y + (Edge.cellHeight / 6) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y - (Edge.cellHeight / 6) };
                }
            }
            return point;
        }

        const key = input[1];
        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(key);
        const isDiamondCorner = ['topLeftD', 'topRightD', 'bottomLeftD', 'bottomRightD'].includes(key);

        // If the node is specified by an id string, find it in the nodes array.
        if (key === 'center') {
            if (typeof input[0] === 'string') {
                // Use Array.find() to locate the node by its id.
                const node = nodes.find(n => n.name === input[0]);
                if (!node) throw new Error(`Node ${input[0]} not found.`);
                result = node.cell.getCenter();
            } else {
                result = input[0].getCenter();
            }
        } else if (typeof input[0] === 'string') {
            // Look up the node in the array.
            const node = nodes.find(n => n.name === input[0]);
            if (!node) throw new Error(`Node ${input[0]} not found.`);

            if (isCorner) {
                result = node.cell.getCorners()[key as CornerPointType];
            } else if (isDiamondCorner) {
                const topPoint = resolveDiamondPoint(node, 'top');
                const bottomPoint = resolveDiamondPoint(node, 'bottom');
                const leftPoint = resolveDiamondPoint(node, 'left');
                const rightPoint = resolveDiamondPoint(node, 'right');
                switch (key) {
                    case 'topLeftD':
                        result = { x: (topPoint.x + leftPoint.x) / 2, y: (topPoint.y + leftPoint.y) / 2 };
                        break;
                    case 'topRightD':
                        result = { x: (topPoint.x + rightPoint.x) / 2, y: (topPoint.y + rightPoint.y) / 2 };
                        break;
                    case 'bottomLeftD':
                        result = { x: (bottomPoint.x + leftPoint.x) / 2, y: (bottomPoint.y + leftPoint.y) / 2 };
                        break;
                    case 'bottomRightD':
                        result = { x: (bottomPoint.x + rightPoint.x) / 2, y: (bottomPoint.y + rightPoint.y) / 2 };
                        break;
                }
            } else {
                result = resolveDiamondPoint(node, key as DiamondPointType);
            }
        } else {
            if (isCorner) {
                result = input[0].getCorners()[key as CornerPointType];
            } else if (isDiamondCorner) {
                const diamond = input[0].getOuterDiamond();
                switch (key) {
                    case 'topLeftD':
                        result = { x: (diamond.top.x + diamond.left.x) / 2, y: (diamond.top.y + diamond.left.y) / 2 };
                        break;
                    case 'topRightD':
                        result = { x: (diamond.top.x + diamond.right.x) / 2, y: (diamond.top.y + diamond.right.y) / 2 };
                        break;
                    case 'bottomLeftD':
                        result = { x: (diamond.bottom.x + diamond.left.x) / 2, y: (diamond.bottom.y + diamond.left.y) / 2 };
                        break;
                    case 'bottomRightD':
                        result = { x: (diamond.bottom.x + diamond.right.x) / 2, y: (diamond.bottom.y + diamond.right.y) / 2 };
                        break;
                }
            } else {
                result = input[0].getOuterDiamond()[key as DiamondPointType];
            }
        }

        return { x: result.x, y: result.y };
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
        control: [string, DiamondPointType] | [Cell, DiamondPointType],
        // Change type here as well
        nodes: Node[],
        color: string
    ) {
        if (!context) return;

        // Get control point using the updated resolvePoint
        const controlPoint = Edge.resolvePoint(control, nodes);

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

    drawEdgehead(context: CanvasRenderingContext2D, start: Point, end: Point, color: string, shiftUpwards: boolean) {
        if (shiftUpwards) {
            // Adjust the arrowhead position upwards based on the cell height
            const adjustment = Edge.cellHeight / 1.5; // Dynamically adjust based on cell height
            const angle = Math.atan2((end.y - adjustment) - (start.y - adjustment), end.x - start.x);
            this.drawEdgeheadAtAngle(context, { x: end.x, y: end.y - adjustment }, angle, color);
        } else {
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            this.drawEdgeheadAtAngle(context, end, angle, color);
        }
    }

    drawCurvyEdgehead(context: CanvasRenderingContext2D, start: Point, control: Point, end: Point, color: string) {
        // Compute tangent direction at endpoint of the quadratic Bézier curve
        const t = 1; // At the endpoint
        const dx = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
        const dy = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
        const angle = Math.atan2(dy, dx);

        this.drawEdgeheadAtAngle(context, end, angle, color);
    }

    private drawEdgeheadAtAngle(context: CanvasRenderingContext2D, position: Point, angle: number, color: string) {
        const edgeSize = 10;

        // Draw black outline
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(position.x, position.y);
        context.lineTo(
            position.x - edgeSize * Math.cos(angle - Math.PI / 6),
            position.y - edgeSize * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
            position.x - edgeSize * Math.cos(angle + Math.PI / 6),
            position.y - edgeSize * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.stroke();

        // Draw colored fill
        context.fillStyle = color;
        context.fill();
    }
}
