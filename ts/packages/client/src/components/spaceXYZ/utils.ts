import { Node, NamedLink, NodeData } from './types';


const radius = 200;
const alphaBetaYDistance = 75;


export const getData = (rawData: NodeData[]) => {


    const alphaNodes: Node[] = rawData.map((node, index) => ({
        id: node.name,
        shape: 'sphere',
        val: 5,
        group: 0,
        fx: radius * Math.cos((2 * Math.PI * index) / rawData.length),
        fy: -75,
        fz: radius * Math.sin((2 * Math.PI * index) / rawData.length),
    }));

    const betaNodes: Node[] = rawData.flatMap((node, index) => {
        const alphaNodeX = radius * Math.cos((2 * Math.PI * index) / rawData.length);
        const alphaNodeZ = radius * Math.sin((2 * Math.PI * index) / rawData.length);
        const toolsCount = node.tools.length;

        return node.tools.map((tool, toolIndex) => {
            const angle = (2 * Math.PI * toolIndex) / toolsCount; // Angle for circular placement
            const betaNodeX =
                toolsCount > 1
                    ? alphaNodeX + alphaBetaYDistance * Math.cos(angle)
                    : alphaNodeX; // If only one tool, place it in the center
            const betaNodeZ =
                toolsCount > 1
                    ? alphaNodeZ + alphaBetaYDistance * Math.sin(angle)
                    : alphaNodeZ; // If only one tool, place it in the center

            return {
                id: tool,
                shape: 'sphere',
                val: 3,
                group: 1,
                fx: betaNodeX,
                fy: 75, // y-coordinate above the alphaNode
                fz: betaNodeZ,
            };
        });
    });

    const deltaNodes: Node[] = [
        {
            id: 'GraphState',
            shape: 'square',
            val: 50,
            group: 3,
            fx: 0,
            fy: -50,
            fz: 0,
        },
    ];

    const gammaNodes: Node[] = [
        {
            id: 'SharedResources',
            shape: 'square',
            val: 500,
            group: 2,
            fx: 0,
            fy: 0,
            fz: 0,
        },
    ];

    const alphaInterLinks: NamedLink[] = rawData.flatMap((nodeA, indexA) => {
        return rawData
            .filter((_, indexB) => indexB > indexA) // Avoid duplicate pairs
            .flatMap((nodeB) => [
                {
                    source: nodeA.name, // Source node
                    target: nodeB.name, // Target node
                    name: `${nodeA.name}_${nodeB.name}`, // Name property
                },
                {
                    source: nodeB.name, // Source node
                    target: nodeA.name, // Target node
                    name: `${nodeB.name}_${nodeA.name}`, // Name property
                },
            ]);
    });

    const alphaBetaLinks: NamedLink[] = rawData.flatMap((node, index) =>
        node.tools.flatMap((tool) => [
            {
                source: node.name, // alphaNode ID
                target: tool, // betaNode ID
                name: `${node.name}_${tool}`, // Name property
            },
            {
                source: tool, // betaNode ID
                target: node.name, // alphaNode ID
                name: `${tool}_${node.name}`, // Name property
            },
        ])
    );

    const alphaDeltaLinks: NamedLink[] = rawData.flatMap((node, index) => {
        const circumferenceNode = node.name;
        return [
            {
                source: 'GraphState', // deltaNode ID
                target: circumferenceNode, // alphaNode ID
                name: `GraphState_${circumferenceNode}`, // Name property
            },
            {
                source: circumferenceNode, // alphaNode ID
                target: 'GraphState', // deltaNode ID
                name: `${circumferenceNode}_GraphState`, // Name property
            },
        ];
    });

    const alphaGammaLinks: NamedLink[] = rawData.flatMap((node, index) => {
        const circumferenceNode = node.name;
        return [
            {
                source: 'SharedResources', // gammaNode ID
                target: circumferenceNode, // alphaNode ID
                name: `SharedResources_${circumferenceNode}`, // Name property
            },
            {
                source: circumferenceNode, // alphaNode ID
                target: 'SharedResources', // gammaNode ID
                name: `${circumferenceNode}_SharedResources`, // Name property
            },
        ];
    });

    const betaGammaLinks: NamedLink[] = rawData.flatMap((node, index) =>
        node.tools.flatMap((tool) => [
            {
                source: tool, // betaNode ID
                target: 'SharedResources', // gammaNode ID
                name: `${tool}_SharedResources`, // Name property
            },
            {
                source: 'SharedResources', // gammaNode ID
                target: tool, // betaNode ID
                name: `SharedResources_${tool}`, // Name property
            },
        ])
    );

    const data = {
        nodes: [
            ...alphaNodes,
            ...betaNodes,
            ...deltaNodes,
            ...gammaNodes,
        ],
        links: [
            ...alphaInterLinks,
            ...alphaDeltaLinks,
            ...alphaGammaLinks,
            ...alphaBetaLinks,
            ...betaGammaLinks,
        ]
    };

    return data;
}




type StepType = {
    name: string; // ATTENTION: better type
    switchAlpha: 0 | 1;
    switchBeta: -1 | 0 | 1;
    switchDelta: -1 | 0 | 1;
    switchGamma: -1 | 0 | 1;
}

export const path: StepType[] = [
    { name: 'AlphaSuper_NodeLoadInputs', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 1 },
    { name: 'NodeLoadInputs_SharedResources', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'SharedResources_NodeLoadInputs', switchAlpha: 0, switchBeta: 0, switchDelta: 0, switchGamma: 0 },
    { name: 'NodeLoadInputs_GraphState', switchAlpha: 1, switchBeta: 0, switchDelta: 0, switchGamma: -1 },
    { name: 'GraphState_NodeLoadInputs', switchAlpha: 0, switchBeta: 0, switchDelta: 1, switchGamma: 0 },
    { name: 'NodeLoadInputs_NodeGenerateCandidate', switchAlpha: 1, switchBeta: 0, switchDelta: -1, switchGamma: 0 },
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