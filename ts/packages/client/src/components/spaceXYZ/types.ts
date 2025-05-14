
export interface Node {
    id: string;
    shape: 'sphere' | 'square';
    val: number;
    group: number;
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