
export interface GraphSpec<T> {
    spec: T;
}

export interface _GraphSpec_ToolProof {
    name: string;
    tools: string[];
}

export interface GraphSpec_ToolProof extends GraphSpec<_GraphSpec_ToolProof[]> { }