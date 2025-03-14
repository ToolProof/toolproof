import { ResourceRoleType } from './resourceRoles';

//
export const tools = {
    autodock: {
        description: '',
        inputs: (() => {
            const values = ['ligand_smiles', 'receptor_pdb', 'box_pdb'] as const satisfies ResourceRoleType[];
            return new Set(values);
        })(),
        outputs: (() => {
            const values = ['docking_result_pdb', 'docking_pose_sdf'] as const satisfies ResourceRoleType[];
            return new Set(values);
        })(),
    },
} as const;

export type ToolType = keyof typeof tools;

