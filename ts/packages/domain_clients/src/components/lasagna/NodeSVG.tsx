import { Node, NodeNameType } from './classes';

interface NodeSVGProps {
    nodeName: NodeNameType;
    node: Node;
    color: string;
    handleNodeClickHelper: (nodeName: NodeNameType) => void;
}

const NodeSVG: React.FC<NodeSVGProps> = ({ nodeName, node, color, handleNodeClickHelper }) => {
    const { col, row, width, height } = node.cell;
    const x = col * width;
    const y = row * height;

    // Calculate smaller size for 'data_Private' nodes
    const scaleFactor = 2;
    const smallWidth = (width / 3) * scaleFactor; // Corresponds to rectWidth
    const smallHeight = (height / 3) * scaleFactor; // Corresponds to rectHeight
    const smallX = x + (width - smallWidth) / 2; // Centered horizontally
    const smallY = y + (height - smallHeight) / 2; // Centered vertically

    const handleClick = () => {
        return;
        handleNodeClickHelper(nodeName);
    };

    if (nodeName === 'ResourcesLeft' || nodeName === 'ResourcesRight') {
        return null;
    }

    const strokeColor = 'transparent'; // Default stroke color

    return (
        <>
            {node.nature === 'logic' ? (
                <ellipse
                    cx={x + width / 2}
                    cy={y + height / 2}
                    rx={width / 2}
                    ry={height / 2 + 10}
                    fill={color}
                    stroke={strokeColor}
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : node.nature === 'data_Private' ? (
                <rect
                    x={smallX} // Centered horizontally
                    y={smallY} // Centered vertically
                    width={smallWidth} // Smaller width
                    height={smallHeight} // Smaller height
                    fill={color}
                    stroke={strokeColor}
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            ) : (
                <rect
                    x={x - 2 * width} // Start from the leftmost preceding cell
                    y={y} // Keep the same vertical position
                    width={width * 5} // Current cell + 2 preceding + 2 succeeding
                    height={height} // Keep the same height
                    fill={color}
                    stroke={strokeColor}
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            )}

            {/* Ensure text does not interfere with clickability */}
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
        </>
    );
};

export default NodeSVG;