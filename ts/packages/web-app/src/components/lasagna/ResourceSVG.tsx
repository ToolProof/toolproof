import { Resource, ResourceNameType } from './classes';

interface ResourceSVGProps {
    resourceName: ResourceNameType;
    resource: Resource;
    color: string;
    handleResourceClickHelper: (resourceName: ResourceNameType) => void;
}

const ResourceSVG: React.FC<ResourceSVGProps> = ({ resourceName, resource, color, handleResourceClickHelper }) => {
    const { col, row, width, height } = resource.cell;
    const x = col * width;
    const y = row * height;

    // Calculate smaller size for 'code_glue' resources
    const shouldBeSmall = resource.nature === 'code_glue';
    const smallWidth = width / 2;
    const smallHeight = height / 1.5;
    const smallX = x + (width - smallWidth) / 2;
    const smallY = y + (height - smallHeight) / 2;

    const handleClick = () => {
        handleResourceClickHelper(resourceName);
    };

    /* if (shouldBeSmall) {
        return null;
    } */

    return (
        <>
            {resource.nature === 'data' ? (
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
                    {resourceName}
                </text>
            )}
        </>
    );
};


export default ResourceSVG;