import { Node, NamedLink, GraphSpec, ActiveStates } from './types';
import { NodeObject } from 'react-force-graph-3d';
import * as THREE from 'three';


const radius = 200;
const alphaBetaYDistance = 75;

const FRAME_DURATION = 1000 / 60;
const DESIRED_TRAVEL_MS = 2000;


export function computeSpeedForDuration(_link, desiredMs = DESIRED_TRAVEL_MS) {
    const speed = FRAME_DURATION / desiredMs;
    // console.log('speed', speed);
    return speed;
}


export const getGraphData = (graphSpec: GraphSpec[]) => {


    const nodes_Alpha: Node[] = graphSpec.map((node, index) => ({
        id: node.name,
        shape: 'sphere',
        val: 5,
        group: 'Alpha',
        fx: radius * Math.cos((2 * Math.PI * index) / graphSpec.length),
        fy: -75,
        fz: radius * Math.sin((2 * Math.PI * index) / graphSpec.length),
    }));

    const nodes_BetaOne: Node[] = [
        {
            id: 'GraphState',
            shape: 'square',
            val: 50,
            group: 'BetaOne',
            fx: 0,
            fy: -50,
            fz: 0,
        },
    ];

    const nodes_BetaTwo: Node[] = [
        {
            id: 'SharedResources',
            shape: 'square',
            val: 500,
            group: 'BetaTwo',
            fx: 0,
            fy: 0,
            fz: 0,
        },
    ];

    const nodes_Gamma: Node[] = graphSpec.flatMap((node, index) => {
        const alphaNodeX = radius * Math.cos((2 * Math.PI * index) / graphSpec.length);
        const alphaNodeZ = radius * Math.sin((2 * Math.PI * index) / graphSpec.length);
        const toolsCount = node.tools.length;

        return node.tools.map((tool, toolIndex) => {
            const angle = (2 * Math.PI * toolIndex) / toolsCount; // Angle for circular placement
            const gammaNodeX =
                toolsCount > 1
                    ? alphaNodeX + alphaBetaYDistance * Math.cos(angle)
                    : alphaNodeX; // If only one tool, place it in the center
            const gammaNodeZ =
                toolsCount > 1
                    ? alphaNodeZ + alphaBetaYDistance * Math.sin(angle)
                    : alphaNodeZ; // If only one tool, place it in the center

            return {
                id: tool,
                shape: 'sphere',
                val: 3,
                group: 'Gamma',
                fx: gammaNodeX,
                fy: 75, // y-coordinate above the alphaNode
                fz: gammaNodeZ,
            };
        });
    });



    const links_Alpha_Alpha: NamedLink[] = graphSpec.flatMap((nodeA, indexA) => {
        return graphSpec
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

    const links_Alpha_Gamma: NamedLink[] = graphSpec.flatMap((node, index) =>
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

    const links_Alpha_BetaOne: NamedLink[] = graphSpec.flatMap((node, index) => {
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

    const links_Alpha_BetaTwo: NamedLink[] = graphSpec.flatMap((node, index) => {
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

    const links_BetaTwo_Gamma: NamedLink[] = graphSpec.flatMap((node, index) =>
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

    const graphData = {
        nodes: [
            ...nodes_Alpha,
            ...nodes_Gamma,
            ...nodes_BetaOne,
            ...nodes_BetaTwo,
        ],
        links: [
            ...links_Alpha_Alpha,
            ...links_Alpha_BetaOne,
            ...links_Alpha_Gamma,
            ...links_Alpha_Gamma,
            ...links_BetaTwo_Gamma,
        ]
    };

    return graphData;
}


export const getNodeThreeObject = (node: NodeObject<NodeObject<Node>>, activeStates: ActiveStates, message: string) => {
    const group = new THREE.Group();

    // 🎯 Base node size scaling
    let baseSize = Math.cbrt(node.val ?? 1) * 10;

    // 🔷 Determine shape and color
    let mesh: THREE.Object3D;

    if (node.group === 'BetaTwo') {
        // const geometry = new THREE.TetrahedronGeometry(baseSize, 0);
        baseSize *= 0.5;
        const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
        const material = new THREE.MeshLambertMaterial({
            color: 'pink' //activeStates.isDeltaActive ? 'green' : 'red'
        });
        mesh = new THREE.Mesh(geometry, material);
    } else if (node.group === 'BetaOne') {
        baseSize *= 0.5;
        const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
        const material = new THREE.MeshLambertMaterial({
            color: 'pink' //activeStates.isGammaActive ? 'green' : 'red'
        });
        mesh = new THREE.Mesh(geometry, material);
    } else if (node.group === 'Gamma') {
        const radius = baseSize * 0.4;
        const height = baseSize;
        const geometry = new THREE.ConeGeometry(radius, height, 16);
        const material = new THREE.MeshLambertMaterial({
            color: 'pink' //node.id === activeStates.activeBetaId ? 'blue' : 'red'
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 1;
    } else if (node.group === 'Alpha') {
        const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
        const material = new THREE.MeshLambertMaterial({
            // color: node.id === activeAlphaId ? 'yellow' : 'red'
            color: message.includes(node.id) ? 'yellow' : 'red'
        });
        mesh = new THREE.Mesh(geometry, material);
    } else {
        throw new Error(`Unknown node group: ${node.group}`);
    }

    group.add(mesh);

    // 🏷️ Label sprite
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const labelFontSize = 16;
    const text = node.id;

    context.font = `${labelFontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth;
    canvas.height = labelFontSize + 10;

    context.font = `${labelFontSize}px Arial`;
    context.fillStyle = 'white';
    context.fillText(text, 0, labelFontSize);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);

    // ✏️ Size and position of label
    sprite.scale.set(textWidth / 4, canvas.height / 4, 1);
    const labelGap = 4;
    sprite.position.set(0, baseSize * 0.6 + labelGap, 0);

    group.add(sprite);

    return group;
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