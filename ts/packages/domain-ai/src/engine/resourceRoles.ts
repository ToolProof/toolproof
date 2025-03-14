
// resourceRoles defines various types of files that serve as inputs and outputs for tools
export const resourceRoles = {
    ligand_smiles: { description: 'SMILES string representing the molecular structure of the ligand' },
    receptor_pdb: { description: 'Protein Data Bank (PDB) file representing the molecular structure of the receptor' },
    box_pdb: { description: 'Protein Data Bank (PDB) file representing the search space for the docking simulation' },
    docking_result_pdb: { description: 'Protein Data Bank (PDB) file representing the docking result' },
    docking_pose_sdf: { description: 'Structure Data File (SDF) representing the docking pose' },
} as const;

export type ResourceRoleType = keyof typeof resourceRoles;