import * as THREE from 'three';


export const parseSDF = (sdf: string) => {
    const lines = sdf.split('\n');
    const countsLine = lines[3];
    const atomCount = parseInt(countsLine.slice(0, 3).trim());
    const bondCount = parseInt(countsLine.slice(3, 6).trim());

    const atoms = [];
    for (let i = 0; i < atomCount; i++) {
        const line = lines[4 + i];
        const x = parseFloat(line.slice(0, 10).trim());
        const y = parseFloat(line.slice(10, 20).trim());
        const z = parseFloat(line.slice(20, 30).trim());
        const element = line.slice(31, 34).trim().toUpperCase();
        atoms.push({ id: i + 1, element, position: new THREE.Vector3(x, y, z) });
    }

    const bonds = [];
    for (let i = 0; i < bondCount; i++) {
        const line = lines[4 + atomCount + i];
        const a1 = parseInt(line.slice(0, 3).trim());
        const a2 = parseInt(line.slice(3, 6).trim());
        const order = parseInt(line.slice(6, 9).trim());
        bonds.push({ a1, a2, order });
    }

    return { atoms, bonds };
}


export const parsePDB = (pdb: string) => {
    const lines = pdb.split('\n');

    const atoms: {
        id: number;
        element: string;
        position: THREE.Vector3;
    }[] = [];

    const elementRegex = /^[A-Z]{1,2}$/;

    for (const line of lines) {
        if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
            const x = parseFloat(line.slice(30, 38).trim());
            const y = parseFloat(line.slice(38, 46).trim());
            const z = parseFloat(line.slice(46, 54).trim());
            let element = line.slice(76, 78).trim();

            if (!elementRegex.test(element)) {
                // fallback: try from atom name field if element field is blank
                element = line.slice(12, 14).trim().replace(/[0-9]/g, '');
            }

            atoms.push({
                id: atoms.length + 1,
                element: element.toUpperCase(),
                position: new THREE.Vector3(x, y, z),
            });
        }
    }

    // Infer bonds based on distance threshold (e.g., ≤ 1.8 Å for covalent bonds)
    const bonds: {
        a1: number;
        a2: number;
        order: number;
    }[] = [];

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const dist = atoms[i].position.distanceTo(atoms[j].position);
            if (dist > 0.4 && dist <= 1.8) {
                bonds.push({ a1: atoms[i].id, a2: atoms[j].id, order: 1 });
            }
        }
    }

    return { atoms, bonds };
};