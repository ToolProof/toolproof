
// Defines the core objective of ToolProof
export const primeGoal = 'remove suffering and promote well-being';

//
export const resourceRoles = {
    ligand_smiles: { description: 'SMILES string representing the molecular structure of the ligand' },
    receptor_pdb: { description: 'Protein Data Bank (PDB) file representing the molecular structure of the receptor' },
    box_pdb: { description: 'Protein Data Bank (PDB) file representing the search space for the docking simulation' },
    docking_result_pdb: { description: 'Protein Data Bank (PDB) file representing the docking result' },
    docking_pose_sdf: { description: 'Structure Data File (SDF) representing the docking pose' },
} as const;

export type ResourceRoleType = keyof typeof resourceRoles;

//
export const tools = {
    autodock: {
        description: '',
        inputs: (() => {
            const values = ['ligand_smiles', 'receptor_pdb', 'box_pdb']  as const satisfies ResourceRoleType[];
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['docking_result_pdb', 'docking_pose_sdf'] as const satisfies ResourceRoleType[];
            return new Set(values);
        })(),
    },
} as const;

export type ToolType = keyof typeof tools;

    


/* anchor: { description: 'An Anchor serves as a starting point for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.' },
    target: { description: 'The Target is a protein that is known to play a role in the target disease. The goal of the drug discovery process is to find a candidate ligand that binds to the Target.' },
    box: { description: 'A Box refers to the search space where the docking simulation occurs. This box defines the region of interest within the target macromolecule (such as a protein or DNA) where potential ligand binding sites are explored. The docking algorithm only searches for ligand binding poses within the specified box. If the box is too small, it may miss relevant binding sites; if too large, it increases computational cost.' } */

