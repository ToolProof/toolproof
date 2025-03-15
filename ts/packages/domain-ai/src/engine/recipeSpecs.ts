import { Recipe } from "./types.js";

export const alpha: Recipe<["autodock"]> = {
    description: "Alpha",
    recipeSpecs: {
        subGoal_1: {
            tools: ["autodock"],
            inputs: {
                ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" },
                receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" },
                box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" },
            }
        },
        subGoal_2: {
            // @ts-expect-error
            tools: [],
            inputs: {
                ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" },
                receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" },
                box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" },
            }
        },
        subGoal_3: {
            // @ts-expect-error
            tools: ["autodock", "invalid_tool"],
            inputs: {
                ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" },
                receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" },
                box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" },
            }
        }
    }
}





