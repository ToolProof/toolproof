

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
    | 'AI'
    | 'Humans'
    | 'Tools'
    | 'DummyTop'
    | 'DummyTools'
    | 'DummyAI'
    | 'DummyHumans'
    | 'DummyBottom'
    | 'DummyToolsB'
    | 'DummyAIB'
    | 'DummyHumansB'


export type EdgeNameType =
    // | 'Tools_Humans'
    // | 'Humans_Tools'
    | 'AI_Tools'
    | 'Tools_AI'
    | 'AI_Humans'
    | 'Humans_AI'
    | 'Tools_Humans'
    | 'Humans_Tools'
    | 'Tools_DummyTools'
    | 'DummyTools_Tools'
    | 'AI_DummyAI'
    | 'DummyAI_AI'
    | 'Humans_DummyHumans'
    | 'DummyHumans_Humans'
    | 'DummyTop_DummyTools'
    | 'DummyTools_DummyAI'
    | 'DummyAI_DummyHumans'
    | 'DummyHumans_DummyBottom'
    | 'DummyTools_DummyToolsBA'
    | 'DummyTools_DummyToolsBB'
    | 'DummyAI_DummyAIBA'
    | 'DummyAI_DummyAIBB'
    | 'DummyHumans_DummyHumansBA'
    | 'DummyHumans_DummyHumansBB'


export type GraphElementNameType = NodeNameType | EdgeNameType;


export type Environment = 'lg' | 'vercel' | 'gcp';
export type Nature = 'code' | 'code_ai' | 'data' | 'data_meta' | 'dummy';


export class GraphElement {
    draw(context: CanvasRenderingContext2D, color: string, key?: GraphElementNameType, helperSwitch?: boolean) {
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

    fill(context: CanvasRenderingContext2D, key: NodeNameType, showAssistant: boolean) {
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
        } else if (this.nature === 'code_ai' && key === 'AI' && showAssistant) {
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

    draw(context: CanvasRenderingContext2D, color: string, key: NodeNameType, showAssistant: boolean) {
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
        } else if (this.nature === 'code_ai' && key === 'AI' && showAssistant) {
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
        /* if (displayText === 'AI') {
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
        // Helper to adjust diamond points for node-based inputs.
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

        // New branch: if the key is 'center', return the cell's center.
        if (key === 'center') {
            if (typeof input[0] === 'string') {
                const node = nodes[input[0]];
                if (!node) throw new Error(`Node ${input[0]} not found.`);
                return node.cell.getCenter();
            } else {
                return input[0].getCenter();
            }
        }

        const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(key);
        const isDiamondCorner = ['topLeftD', 'topRightD', 'bottomLeftD', 'bottomRightD'].includes(key);

        if (typeof input[0] === 'string') {
            const node = nodes[input[0]];
            if (!node) throw new Error(`Node ${input[0]} not found.`);

            if (isCorner) {
                return node.cell.getCorners()[key as CornerPointType];
            } else if (isDiamondCorner) {
                // For diamond-corner types, compute the average of two adjusted diamond points.
                const topPoint = resolveDiamondPoint(node, 'top');
                const bottomPoint = resolveDiamondPoint(node, 'bottom');
                const leftPoint = resolveDiamondPoint(node, 'left');
                const rightPoint = resolveDiamondPoint(node, 'right');
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
                return resolveDiamondPoint(node, key as DiamondPointType);
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