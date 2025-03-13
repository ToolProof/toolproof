
// Defines the core objective of ToolProof
export const primeGoal = 'remove suffering and promote well-being';

export type FooType = 'Alpha' | 'Beta' | 'Gamma' | 'Delta' | 'Alpha2' | 'Beta2' | 'Alpha3' | 'Gamma2' | 'Alpha4' | 'Gamma3' | 'Alpha5' | 'Delta2' | 'Ypsilon' | 'Zeta' | 'Eta' | 'Theta' | 'Iota' | 'Kappa' | 'Lambda' | 'Mu' | 'Nu' | 'Xi' | 'Omicron' | 'Pi' | 'Rho' | 'Sigma' | 'Tau' | 'Upsilon' | 'Phi' | 'Chi' | 'Psi' | 'Omega';

type Tool_Metadata_Type = {
    [key: string]: {
        description: string;
        inputs: Set<FooType>;
        outputs: Set<FooType>;
    }
}

// Centralized metadata for tools, including descriptions and required resources
export const TOOL_METADATA = {
    A: {
        description: '',
        inputs: (() => {
            const values = ['Alpha', 'Beta'] as const;
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['Alpha2', 'Beta2'] as const;
            return new Set(values);
        })(),
    },
    B: {
        description: '',
        inputs: (() => {
            const values = ['Alpha2', 'Gamma'] as const;
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['Alpha3', 'Gamma2'] as const;
            return new Set(values);
        })(),
    },
    C: {
        description: '',
        inputs: (() => {
            const values = ['Alpha3', 'Gamma2'] as const;
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['Alpha4', 'Gamma3'] as const;
            return new Set(values);
        })(),
    },
    D: {
        description: '',
        inputs: (() => {
            const values = ['Ypsilon', 'Delta'] as const;
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['Alpha5', 'Delta2'] as const;
            return new Set(values);
        })(),
    },
} as const;


// Centralized metadata for resources, including descriptions
export const RESOURCE_ROLE_METADATA = {
    anchor: { description: 'An Anchor serves as a starting point for the drug discovery process. An Anchor is usually an existing, though suboptimal, drug (also known as a ligand) for the target disease. Anchors are represented as .pdb (Protein Data Bank) files or SMILES strings, both used to depict molecular structures.' },
    target: { description: 'The Target is a protein that is known to play a role in the target disease. The goal of the drug discovery process is to find a candidate ligand that binds to the Target.' },
    box: { description: 'A Box refers to the search space where the docking simulation occurs. This box defines the region of interest within the target macromolecule (such as a protein or DNA) where potential ligand binding sites are explored. The docking algorithm only searches for ligand binding poses within the specified box. If the box is too small, it may miss relevant binding sites; if too large, it increases computational cost.' }
} as const;

