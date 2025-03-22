import { ResourceRoleType } from './resourceRoles';

// tools defines AI-invokable functionalities, each specifying the resourceRoles it accepts as inputs and produces as outputs
export const tools = {
    autodock: {
        description: 'Dock a ligand into a receptor using AutoDock, an open-source tool for molecular docking.',
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

