import { Node, NodeNameType } from './classes';

interface NodeSVGProps {
    nodeName: NodeNameType;
    node: Node;
    color: string;
    handleNodeClickHelper: (nodeName: NodeNameType) => void;
    showAssistant: boolean;
}

const NodeSVG: React.FC<NodeSVGProps> = ({ nodeName, node, color, handleNodeClickHelper, showAssistant }) => {
    const { col, row, width, height } = node.cell;
    const x = col * width;
    const y = row * height;

    // Calculate smaller size for 'dummy' nodes
    const shouldBeSmall = node.nature === 'data_meta';
    const smallWidth = width / 2;
    const smallHeight = height / 1.5;
    const smallX = x + (width - smallWidth) / 2;
    const smallY = y + (height - smallHeight) / 2;

    const handleClick = () => {
        handleNodeClickHelper(nodeName);
    };

    /* if (shouldBeSmall) {
        return null;
    } */

    if (!showAssistant && nodeName === 'Assistant') {
        return null;
    }
    if (nodeName.includes('Dummy')) {
        return null;
    }

    return (
        <>
            {node.nature === 'data' ? (
                <ellipse
                    cx={x + width / 2}
                    cy={y + height / 2}
                    rx={width / 2}
                    ry={height / 2 + 10}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : node.nature === 'data_meta' ? (
                <ellipse
                    cx={x + smallWidth / 2} // Left-aligned
                    cy={y + height / 2}
                    rx={smallWidth / 2}
                    ry={smallHeight / 2}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : node.nature === 'code_ai' && nodeName === 'AI' && showAssistant ? (
                <polygon
                    points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : node.nature === 'code_ai' ? (
                <polygon
                    points={`${x + width / 2},${y - height / 6} ${x + width + width / 6},${y + height / 2} ${x + width / 2},${y + height + height / 6} ${x - width / 6},${y + height / 2}`}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : (
                <rect
                    x={shouldBeSmall ? smallX : x}
                    y={shouldBeSmall ? smallY : y}
                    width={shouldBeSmall ? smallWidth : width}
                    height={shouldBeSmall ? smallHeight : height}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            )}

            {/* Ensure text does not interfere with clickability */}
            {!shouldBeSmall && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fontSize="16px"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="black"
                    pointerEvents="none" // Prevents text from intercepting clicks
                >
                    {/* {nodeName} */}
                </text>
            )}
        </>
    );
};

export default NodeSVG;