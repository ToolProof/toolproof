import { Recipe } from "./types.js";

export const alpha: Recipe<["autodock"]> = {
    name: "alpha", // ATTENTION: typesscript doesn't flag if this is missing
    description: "Start by fetching an anchor-ligand (a starting point for the docking process), a receptor, and a box from Storage. Then generate a candidate-ligand with the aim to increase the binding affinity with respect to the receptor. Then invoke the autodock tool to perform docking. Then fetch the results from storage and evaluate them. If they are promising, end the process. If not, go back to generating a new candidate-ligand and continue the process from there.", // ATTENTION: typesscript doesn't flag if this is missing
    recipeSpecs: {
        subGoal_1: {
            tools: ["autodock"],
            inputs: {
                ligand_smiles: { role: "ligand_smiles", path: "resources/imatinib.txt" },
                receptor_pdb: { role: "receptor_pdb", path: "resources/1iep_no_lig.pdb" },
                box_pdb: { role: "box_pdb", path: "resources/xray-imatinib.pdb" },
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
};





