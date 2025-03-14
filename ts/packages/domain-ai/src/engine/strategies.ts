import { Strategy } from "./types.js";

const validStrategy: Strategy<["autodock"]> = {
    subGoals: [],
    description: "Example strategy using autodock",
    resources: {
        ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" },
        receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" },
        box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" }, 
    }
};