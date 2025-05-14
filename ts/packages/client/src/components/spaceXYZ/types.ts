
export type Greek = 'Alpha' | 'Beta' | 'Gamma' | 'Delta'| 'Epsilon' | 'Zeta' | 'Eta' | 'Theta' | 'Iota' | 'Kappa' | 'Lambda' | 'Mu' | 'Nu' | 'Xi' | 'Omicron' | 'Pi' | 'Rho' | 'Sigma' | 'Tau' | 'Upsilon' | 'Phi' | 'Chi' | 'Psi' | 'Omega';
type Digit = 'One' | 'Two' | 'Three' | 'Four';     // Extend as needed

export type GroupType = Greek | `${Greek}${Digit}`;

export interface Node {
    id: string;
    shape: 'sphere' | 'square';
    val: number;
    group: GroupType;
    fx: number;
    fy: number;
    fz: number;
}

export interface Link {
    source: string;
    target: string;
}

export interface NamedLink extends Link {
    name: string;
}

export interface GraphData {
    nodes: Node[];
    links: NamedLink[];
}

export type GraphSpec = {
    name: string;
    tools: string[];
}

export interface ActiveStates {
    activeAlphaId: string | Node;
    activeBetaId: string | Node;
    isDeltaActive: boolean;
    isGammaActive: boolean;
}

export type Celarbo = {
    name: string;
    description?: string;
    branches: Celarbo[] | 'category';
}