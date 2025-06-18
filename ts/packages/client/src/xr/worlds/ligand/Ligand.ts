import { XRWorld } from 'threebase/dist/XRWorld';
import { fetchData } from './data';
import { parseSDF, parsePDB } from './utils';
import * as THREE from 'three';


class Ligand extends XRWorld {
    private data_sdf = '';
    private data_pdb = '';

    constructor(container: HTMLDivElement) {
        super(container, 'atom', 'yellow');
    }

    async init() {

        /* const source_sdf = 'tp_resources/ligandokreado/1iep/2025-06-18T20:31:41.325Z/pose.sdf';
        this.data_sdf = await fetchData(source_sdf);
        const { atoms, bonds } = parseSDF(this.data_sdf); */

        const source_pdb = 'tp_resources/ligandokreado/1iep/2025-06-18T20:31:41.325Z/receptor_cryst1FH.pdb';
        this.data_pdb = await fetchData(source_pdb);
        const { atoms, bonds } = parsePDB(this.data_pdb);

        const center = new THREE.Vector3();
        atoms.forEach(atom => center.add(atom.position));
        center.divideScalar(atoms.length);
        atoms.forEach(atom => atom.position.sub(center));

        atoms.forEach(atom => {
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: this.getColorForElement(atom.element) });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(atom.position);
            sphere.userData = { type: 'atom' };
            this.scene.add(sphere);
        });

        bonds.forEach(bond => {
            const a1 = atoms[bond.a1 - 1];
            const a2 = atoms[bond.a2 - 1];
            this.drawBond(a1.position, a2.position, bond.order);
        });

    }

    private getColorForElement(element: string): string {
        const colors: Record<string, string> = {
            H: 'white', C: 'gray', N: 'blue', O: 'red', F: 'green',
            CL: 'green', BR: 'brown', I: 'purple', P: 'orange',
            S: 'yellow', FE: 'darkred', default: 'black',
        };
        return colors[element.toUpperCase()] || colors.default;
    }

    private drawBond(p1: THREE.Vector3, p2: THREE.Vector3, order: number = 1) {
        const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
        const distance = p1.distanceTo(p2);
        const cylinderGeometry = new THREE.CylinderGeometry(0.07, 0.07, distance, 8);

        const offsetAxis = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
        if (offsetAxis.length() < 0.01) offsetAxis.crossVectors(direction, new THREE.Vector3(1, 0, 0));
        offsetAxis.normalize();

        const spacing = 0.12;
        for (let i = 0; i < order; i++) {
            const shift = (i - (order - 1) / 2) * spacing;
            const offset = offsetAxis.clone().multiplyScalar(shift);
            const start = p1.clone().add(offset);
            const end = p2.clone().add(offset);
            const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

            const material = new THREE.MeshStandardMaterial({ color: 'black', emissive: new THREE.Color('black') });
            const cylinder = new THREE.Mesh(cylinderGeometry, material);
            cylinder.position.copy(mid);
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, start).normalize());
            cylinder.userData = { type: 'bond' };
            this.scene.add(cylinder);
        }
    }

}

export { Ligand };
