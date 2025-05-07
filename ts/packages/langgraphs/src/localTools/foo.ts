
// Helper function to generate PDB format for the box
export const generateBoxPDB = (boxCoords: any): string => {
    const { center_x, center_y, center_z, size_x, size_y, size_z } = boxCoords;

    // Calculate corner points
    const halfX = size_x / 2;
    const halfY = size_y / 2;
    const halfZ = size_z / 2;

    // Generate PDB format with 8 corner points and connecting lines
    let pdbContent = "HEADER    DOCKING BOX\n";

    // Add 8 corner points as atoms
    const corners = [
        [center_x - halfX, center_y - halfY, center_z - halfZ],
        [center_x + halfX, center_y - halfY, center_z - halfZ],
        [center_x + halfX, center_y + halfY, center_z - halfZ],
        [center_x - halfX, center_y + halfY, center_z - halfZ],
        [center_x - halfX, center_y - halfY, center_z + halfZ],
        [center_x + halfX, center_y - halfY, center_z + halfZ],
        [center_x + halfX, center_y + halfY, center_z + halfZ],
        [center_x - halfX, center_y + halfY, center_z + halfZ]
    ];

    corners.forEach((corner, i) => {
        pdbContent += `ATOM  ${(i + 1).toString().padStart(5)} ${' C  '.padEnd(4)}BOX A${(i + 1).toString().padStart(4)}    ${corner[0].toFixed(3).padStart(8)}${corner[1].toFixed(3).padStart(8)}${corner[2].toFixed(3).padStart(8)}  1.00  0.00           C\n`;
    });

    // Add connecting lines as CONECT records
    pdbContent += "CONECT    1    2    4    5\n";
    pdbContent += "CONECT    2    1    3    6\n";
    pdbContent += "CONECT    3    2    4    7\n";
    pdbContent += "CONECT    4    1    3    8\n";
    pdbContent += "CONECT    5    1    6    8\n";
    pdbContent += "CONECT    6    2    5    7\n";
    pdbContent += "CONECT    7    3    6    8\n";
    pdbContent += "CONECT    8    4    5    7\n";
    pdbContent += "END\n";

    return pdbContent;
};
