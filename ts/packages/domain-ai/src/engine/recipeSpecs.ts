import { Foo } from "./types.js";

// ATTENTION: how is "autodock" being inferred here?

export const alpha: Foo = {
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
            tools: ["autodock"],
            inputs: {
                ligand_smiles: { role: "ligand_smiles", path: "imatinib.txt" },
                receptor_pdb: { role: "receptor_pdb", path: "1iep_no_lig.pdb" },
                box_pdb: { role: "box_pdb", path: "xray-imatinib.pdb" },
            }
        }
    }
}





