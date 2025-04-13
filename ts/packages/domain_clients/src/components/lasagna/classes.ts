import { pathDescriptions } from './texts/textsEng';

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
export type NodeNameType =
    | 'Tools'
    | 'ToolsPrivate'
    | 'Graphs'
    | 'GraphsPrivate'
    | 'Clients'
    | 'ClientsPrivate'
    | 'Resources'
    | 'ResourcesLeft'
    | 'ResourcesRight'


export type EdgeNameType =
    | 'Tools_Graphs'
    | 'Graphs_Tools'
    | 'Graphs_Clients'
    | 'Clients_Graphs'
    | 'Tools_ResourcesLeft'
    | 'ResourcesLeft_Tools'
    | 'Graphs_Resources'
    | 'Resources_Graphs'
    | 'Clients_ResourcesRight'
    | 'ResourcesRight_Clients'
    | 'Tools_ToolsPrivate'
    | 'ToolsPrivate_Tools'
    | 'Graphs_GraphsPrivate'
    | 'GraphsPrivate_Graphs'
    | 'Clients_ClientsPrivate'
    | 'ClientsPrivate_Clients'


export type GraphElementNameType = NodeNameType | EdgeNameType;


export type Environment = 'agnostic' | 'lgp' | 'vercel' | 'gcp';
export type Nature = 'code' | 'data' | 'data_Private' | 'dummy';


export class GraphElement {
    draw(context: CanvasRenderingContext2D, color: string, key?: GraphElementNameType) {
        // Placeholder method to be overridden by subclasses
        console.log('Drawing a graph element');
    }
}


export class Node extends GraphElement {
    constructor(
        public cell: Cell,
        public environment: Environment,
        public nature: Nature,
        public isActive: boolean,
        public description: string
    ) {
        super();
    }

    getFillColor(key: GraphElementNameType): string {
        let color: string;
        if (this.environment === 'agnostic') {
            color = '0, 255, 0';
        } else {
            color = '0, 0, 0'; // black
        }

        const alpha = false ? 0.3 : 1.0;
        return `rgba(${color}, ${alpha})`;
    }

    fill(context: CanvasRenderingContext2D, key: NodeNameType) {
        if (!context) return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust the radius as needed

        context.fillStyle = this.getFillColor(key);

        if (this.nature === 'code') {
            context.beginPath();
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
            context.fill();
        } else if (this.nature === 'data_Private') {
            // Larger centered rectangle
            const scaleFactor = 1.5; // Increase size by 1.5x
            const rectWidth = (this.cell.width / 3) * scaleFactor;
            const rectHeight = (this.cell.height / 3) * scaleFactor;
            const centeredX = x + (this.cell.width - rectWidth) / 2;
            const centeredY = y + (this.cell.height - rectHeight) / 2;
            context.fillRect(centeredX, centeredY, rectWidth, rectHeight);
        } else if (this.nature === 'data') {
            // Combine the current cell and the two preceding and succeeding cells into one large rectangle
            const totalWidth = this.cell.width * 5; // Current cell + 2 preceding + 2 succeeding
            const startX = x - 2 * this.cell.width; // Start from the leftmost preceding cell

            // Fill one large rectangle
            context.fillRect(startX, y, totalWidth, this.cell.height);
        }
    }

    draw(context: CanvasRenderingContext2D, color: string, key: NodeNameType) {
        if (!context) return;
        /* if (key.includes('Dummy')) {
            return null;
        } */

        this.fill(context, key);

        const { col, row } = this.cell;
        const x = col * this.cell.width;
        const y = row * this.cell.height;
        const radius = Math.min(this.cell.width, this.cell.height) / 2 + 10; // Adjust radius for ellipse

        context.strokeStyle = color;
        context.lineWidth = 3; // Adjust as needed

        context.beginPath();

        if (this.nature === 'code') {
            // Ellipse stroke
            context.ellipse(x + this.cell.width / 2, y + this.cell.height / 2, this.cell.width / 2, radius, 0, 0, 2 * Math.PI);
        } else if (this.nature === 'data_Private') {
            // Larger centered rectangle stroke
            const scaleFactor = 1.5; // Increase size by 1.5x
            const rectWidth = (this.cell.width / 3) * scaleFactor;
            const rectHeight = (this.cell.height / 3) * scaleFactor;
            const centeredX = x + (this.cell.width - rectWidth) / 2;
            const centeredY = y + (this.cell.height - rectHeight) / 2;
            context.rect(centeredX, centeredY, rectWidth, rectHeight);
        } else if (this.nature === 'data') {
            // Combine the current cell and the two preceding and succeeding cells into one large rectangle
            const totalWidth = this.cell.width * 5; // Current cell + 2 preceding + 2 succeeding
            const startX = x - 2 * this.cell.width; // Start from the leftmost preceding cell

            // Draw one large rectangle
            context.rect(startX, y, totalWidth, this.cell.height);
        }

        context.stroke();
    }

    drawText(context: CanvasRenderingContext2D, key: string, counter: number) {
        if (!context) return;
        if (key === 'ResourcesLeft' || key === 'ResourcesRight') return;

        const x = this.cell.col * this.cell.width;
        const y = this.cell.row * this.cell.height;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';

        let displayText = key;
        if (key === 'ToolsPrivate' || key === 'GraphsPrivate' || key === 'ClientsPrivate') {
            displayText = 'Private';
        } else if (key === 'Resources') {
            displayText = 'Shared';
        }

        context.fillText(displayText, x + this.cell.width / 2, y + this.cell.height / 2);


        // return;
        // console.log('counter', counter);

        let subText = '';
        const pathDescription = pathDescriptions[counter];
        if (key === 'Node') {
            subText = '';
        } else if (key === 'ComputeEngine') {
            subText = pathDescription.ComputeEngineText;
        } else if (key === 'CloudStorage') {
            subText = pathDescription.CloudStorageText;
        } else if (key === 'Web') {
            subText = '';
        }

        if (subText) {
            context.font = '9px Arial';
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
    private static cellWidth: number;
    private static cellHeight: number;

    constructor(
        startPointSpec: [NodeNameType, EdgePointType] | [Cell, EdgePointType],
        endPointSpec: [NodeNameType, EdgePointType] | [Cell, EdgePointType],
        nodes: Record<NodeNameType, Node>,
        cellWidth: number,
        cellHeight: number,
    ) {
        super();
        Edge.cellWidth = cellWidth;
        Edge.cellHeight = cellHeight;
        this.startPoint = Edge.resolvePoint(startPointSpec, nodes);
        this.endPoint = Edge.resolvePoint(endPointSpec, nodes);
    }

    static resolvePoint(
        input: [NodeNameType, EdgePointType] | [Cell, EdgePointType],
        nodes: Record<NodeNameType, Node>
    ): Point {
        let result: Point = { x: 0, y: 0 }; // Default placeholder value

        function resolveDiamondPoint(node: Node, diamondKey: DiamondPointType): Point {
            const point = node.cell.getOuterDiamond()[diamondKey];
            if (node.nature === 'code') {
                if (diamondKey === 'top') {
                    return { x: point.x, y: point.y - (Edge.cellHeight / 8) }; // ATTENTION
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y + (Edge.cellHeight / 8) };
                }
            } else if (node.nature === 'data_Private') {
                if (diamondKey === 'left') {
                    return { x: point.x + (Edge.cellWidth / 4), y: point.y };
                } else if (diamondKey === 'right') {
                    return { x: point.x - (Edge.cellWidth / 4), y: point.y };
                } else if (diamondKey === 'top') {
                    return { x: point.x, y: point.y + (Edge.cellHeight / 4) };
                } else if (diamondKey === 'bottom') {
                    return { x: point.x, y: point.y - (Edge.cellHeight / 4) };
                }
            }
            return point;
        }

        const key = input[1];
        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(key);
        const isDiamondCorner = ['topLeftD', 'topRightD', 'bottomLeftD', 'bottomRightD'].includes(key);

        if (key === 'center') {
            if (typeof input[0] === 'string') {
                const node = nodes[input[0]];
                if (!node) throw new Error(`Node ${input[0]} not found.`);
                result = node.cell.getCenter();
            } else {
                result = input[0].getCenter();
            }
        } else if (typeof input[0] === 'string') {
            const node = nodes[input[0]];
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

        return {
            x: result.x,
            y: result.y
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
        control: [NodeNameType, DiamondPointType] | [Cell, DiamondPointType],
        nodes: Record<NodeNameType, Node>,
        color: string
    ) {
        if (!context) return;

        // Get control point
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

    drawEdgehead(context: CanvasRenderingContext2D, start: Point, end: Point, color: string) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        this.drawEdgeheadAtAngle(context, end, angle, color);
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


export interface EdgeConfig {
    controlPoint: [NodeNameType, DiamondPointType] | [Cell, DiamondPointType] | null;
    reverse: EdgeNameType | null;
    drawInOrder(fn: (key: EdgeNameType, edgeWithConfig: EdgeWithConfig) => void, key: EdgeNameType, edgeWithConfig: EdgeWithConfig,): void;
    next: (fn: () => boolean) => EdgeNameType | null;
}


export interface EdgeWithConfig {
    edge: Edge;
    config: EdgeConfig;
};