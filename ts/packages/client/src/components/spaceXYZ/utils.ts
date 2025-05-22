
const FRAME_DURATION = 1000 / 60;
const DESIRED_TRAVEL_MS = 2000;

export function computeSpeedForDuration(desiredMs = DESIRED_TRAVEL_MS) {
    const speed = FRAME_DURATION / desiredMs;
    // console.log('speed', speed);
    return speed;
}


type StepType = {
    name: string; // ATTENTION: better type
    switchAlpha: 0 | 1;
    switchBeta: -1 | 0 | 1;
    switchDelta: -1 | 0 | 1;
    switchGamma: -1 | 0 | 1;
}

export const path: StepType[] = [
    { name: 'AlphaSuper_NodeLoadResources', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 1 },
    { name: 'NodeLoadResources_SharedResources', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'SharedResources_NodeLoadResources', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeLoadResources_GraphState', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: -1 },
    { name: 'GraphState_NodeLoadResources', switchAlpha: 0, switchBeta: 0, switchDelta: 1, switchGamma: 0 },
    { name: 'NodeLoadResources_NodeGenerateCandidate', switchAlpha: 1, switchBeta: 0, switchDelta: -1, switchGamma: 0 },
    { name: 'NodeGenerateCandidate_GraphState', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'GraphState_NodeGenerateCandidate', switchAlpha: 0, switchBeta: 0, switchDelta: 1, switchGamma: 0 },
    { name: 'NodeGenerateCandidate_OpenAI-1', switchAlpha: 1, switchBeta: 0, switchDelta: -1, switchGamma: 0 },
    { name: 'OpenAI-1_NodeGenerateCandidate', switchAlpha: 0, switchBeta: 1, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeGenerateCandidate_SharedResources', switchAlpha: 0, switchBeta: -1, switchDelta: 0, switchGamma: 0 },
    { name: 'SharedResources_NodeGenerateCandidate', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 1 },
    { name: 'NodeGenerateCandidate_NodeInvokeDocking', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeInvokeDocking_SchrodingerSuite', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'SchrodingerSuite_SharedResources', switchAlpha: 0, switchBeta: 1, switchDelta: 0, switchGamma: 0 },
    { name: 'SharedResources_SchrodingerSuite', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 1 },
    { name: 'SchrodingerSuite_NodeInvokeDocking', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeInvokeDocking_NodeLoadResults', switchAlpha: 0, switchBeta: -1, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeLoadResults_SharedResources', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'SharedResources_NodeLoadResults', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeLoadResults_NodeEvaluateResults', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: -1 },
    { name: 'NodeEvaluateResults_OpenAI-2', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'OpenAI-2_NodeEvaluateResults', switchAlpha: 0, switchBeta: 1, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeEvaluateResults_NodeGenerateCandidate', switchAlpha: 1, switchBeta: -1, switchDelta: 0, switchGamma: 0 },
];