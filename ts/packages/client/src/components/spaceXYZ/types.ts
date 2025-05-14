
type Greek = 'Alpha' | 'Beta' | 'Gamma' | 'Delta'; // Extend as needed
type Digit = 'One' | 'Two' | 'Three' | 'Four';     // Extend as needed

type GroupType = Greek | `${Greek}${Digit}`;

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