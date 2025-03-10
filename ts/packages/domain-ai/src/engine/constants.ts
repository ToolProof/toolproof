
// Defines the core objective of ToolProof
export const primeGoal = 'remove suffering and promote well-being';

// Centralized metadata for tools, including descriptions and required resources
export const TOOL_METADATA = {
    autodock: {
        description: 'AutoDock is a computational docking software suite used for predicting how small molecules (ligands) bind to a macromolecular target (such as proteins or nucleic acids). It is widely used in structure-based drug discovery to identify potential drug candidates by estimating their binding affinity to biological targets.',
        requiredResources: ['anchor', 'target', 'box'] as const
    }
} as const;

// Centralized metadata for resources, including descriptions
export const RESOURCE_ROLE_METADATA = {
    anchor: { description: 'An Anchor serves as a starting point for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.' },
    target: { description: 'The Target is a protein that is known to play a role in the target disease. The goal of the drug discovery process is to find a candidate ligand that binds to the Target.' },
    box: { description: 'A Box refers to the search space where the docking simulation occurs. This box defines the region of interest within the target macromolecule (such as a protein or DNA) where potential ligand binding sites are explored. The docking algorithm only searches for ligand binding poses within the specified box. If the box is too small, it may miss relevant binding sites; if too large, it increases computational cost.' }
} as const;

