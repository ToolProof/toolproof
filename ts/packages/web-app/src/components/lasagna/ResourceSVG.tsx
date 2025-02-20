import { Resource, ResourceNameType } from './types';

interface ResourceSVGProps {
    name: ResourceNameType;
    resource: Resource;
    color: string;
}

const ResourceSVG: React.FC<ResourceSVGProps> = ({ name, resource, color }) => {
    const { col, row, width, height } = resource.cell;
    const x = col * width;
    const y = row * height;

    // Calculate smaller size for `code_glue`
    const isGlue = resource.nature === 'code_glue';
    const smallWidth = width / 4;
    const smallHeight = height / 2;
    const smallX = x + (width - smallWidth) / 2;
    const smallY = y + (height - smallHeight) / 2;

    const handleClick = () => {
        console.log(`Resource ${name} clicked`);
    };

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
                    x={isGlue ? smallX : x}
                    y={isGlue ? smallY : y}
                    width={isGlue ? smallWidth : width}
                    height={isGlue ? smallHeight : height}
                    fill={color}
                    stroke="black"
                    onClick={handleClick}
                    pointerEvents="visible"
                />
            )}

            {/* Ensure text does not interfere with clickability */}
            {!isGlue && (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fontSize="16px"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="black"
                    pointerEvents="none" // Prevents text from intercepting clicks
                >
                    {name}
                </text>
            )}
        </>
    );
};


export default ResourceSVG;