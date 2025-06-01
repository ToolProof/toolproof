import { GraphSpec, GraphSpec_ToolProof } from 'shared/src/types.js';
import { NodeObject } from 'react-force-graph-3d';
import * as THREE from 'three';

export type Greek = 'Alpha' | 'Beta' | 'Gamma' | 'Delta' | 'Epsilon' | 'Zeta' | 'Eta' | 'Theta' | 'Iota' | 'Kappa' | 'Lambda' | 'Mu' | 'Nu' | 'Xi' | 'Omicron' | 'Pi' | 'Rho' | 'Sigma' | 'Tau' | 'Upsilon' | 'Phi' | 'Chi' | 'Psi' | 'Omega';
type Digit = 'One' | 'Two' | 'Three' | 'Four';     // Extend as needed

export type GroupType = Greek | `${Greek}${Digit}`;

export interface GraphNode {
    id: string;
    val: number;
    group: GroupType;
    fx: number;
    fy: number;
    fz: number;
}

export interface GraphLink {
    source: string;
    target: string;
}

export interface NamedGraphLink extends GraphLink {
    name: string;
}

export interface GraphData {
    nodes: GraphNode[];
    links: NamedGraphLink[];
}


interface _GraphSpec_Celarbo {
    name: string;
    description?: string;
    branches: _GraphSpec_Celarbo[] | 'category';
}

export interface GraphSpec_Celarbo extends GraphSpec<_GraphSpec_Celarbo> { }


export interface GraphSpec_Foo extends GraphSpec<string[]> { }


export interface SpaceInterface {
    graphData: GraphData;
    getNodeThreeObject(node: NodeObject<GraphNode>, message: string): THREE.Object3D;
}


abstract class Space<T> implements SpaceInterface {
    graphData: GraphData;

    constructor(input: T) {
        this.graphData = this.generateGraphData(input);
    }

    protected abstract generateGraphData(input: T): GraphData;

    abstract getNodeThreeObject(node: NodeObject<NodeObject<GraphNode>>, message: string): THREE.Object3D;
}



export class ToolProofSpace extends Space<GraphSpec_ToolProof> {

    constructor(graphSpec: GraphSpec_ToolProof) {
        super(graphSpec);
    }

    protected generateGraphData(graphSpec: GraphSpec_ToolProof): GraphData {

        const radius = 200;
        const alphaBetaYDistance = 75;

        const nodes_Alpha: GraphNode[] = graphSpec.spec.map((node, index) => {
            return {
                id: node.name,
                val: 5,
                group: 'Alpha',
                fx: radius * Math.cos((2 * Math.PI * index) / graphSpec.spec.length),
                fy: -75,
                fz: radius * Math.sin((2 * Math.PI * index) / graphSpec.spec.length),
            };
        });

        const nodes_BetaOne: GraphNode[] = [
            {
                id: 'GraphState',
                val: 50,
                group: 'BetaOne',
                fx: 0,
                fy: -50,
                fz: 0,
            },
        ];

        const nodes_BetaTwo: GraphNode[] = [
            {
                id: 'SharedResources',
                val: 500,
                group: 'BetaTwo',
                fx: 0,
                fy: 0,
                fz: 0,
            },
        ];

        const nodes_Gamma: GraphNode[] = graphSpec.spec.flatMap((node, index) => {
            const alphaNodeX = radius * Math.cos((2 * Math.PI * index) / graphSpec.spec.length);
            const alphaNodeZ = radius * Math.sin((2 * Math.PI * index) / graphSpec.spec.length);
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
                    val: 3,
                    group: 'Gamma',
                    fx: gammaNodeX,
                    fy: 75, // y-coordinate above the alphaNode
                    fz: gammaNodeZ,
                };
            });
        });

        const links_Alpha_Alpha: NamedGraphLink[] = graphSpec.spec.flatMap((nodeA, indexA) => {
            return graphSpec.spec
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

        const links_Alpha_Gamma: NamedGraphLink[] = graphSpec.spec.flatMap((node, index) =>
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

        const links_Alpha_BetaOne: NamedGraphLink[] = graphSpec.spec.flatMap((node, index) => {
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

        const links_Alpha_BetaTwo: NamedGraphLink[] = graphSpec.spec.flatMap((node, index) => {
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

        const links_BetaTwo_Gamma: NamedGraphLink[] = graphSpec.spec.flatMap((node, index) =>
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
                ...links_Alpha_BetaTwo,
                ...links_Alpha_Gamma,
                ...links_Alpha_Gamma,
                ...links_BetaTwo_Gamma,
            ]
        };

        return graphData;
    }

    getNodeThreeObject(node: NodeObject<GraphNode>, message: string): THREE.Object3D {
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
                color: 'red' //activeStates.isDeltaActive ? 'green' : 'red'
            });
            mesh = new THREE.Mesh(geometry, material);
        } else if (node.group === 'BetaOne') {
            baseSize *= 0.5;
            const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
            const material = new THREE.MeshLambertMaterial({
                color: 'red' //activeStates.isGammaActive ? 'green' : 'red'
            });
            mesh = new THREE.Mesh(geometry, material);
        } else if (node.group === 'Gamma') {
            const radius = baseSize * 0.4;
            const height = baseSize;
            const geometry = new THREE.ConeGeometry(radius, height, 16);
            const material = new THREE.MeshLambertMaterial({
                color: 'red' //node.id === activeStates.activeBetaId ? 'blue' : 'red'
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = Math.PI / 1;
        } else if (node.group === 'Alpha') {
            const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
            const material = new THREE.MeshLambertMaterial({
                // color: node.id === activeAlphaId ? 'yellow' : 'red'
                color: message.toLowerCase().includes(node.id.toLowerCase()) ? 'yellow' : 'red'
            });
            console.log('node.id', node.id);
            console.log('message', message);

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

}


export class CelarboSpace extends Space<GraphSpec_Celarbo> {

    constructor(graphSpec_Celarbo: GraphSpec_Celarbo) {
        super(graphSpec_Celarbo);
    }

    protected generateGraphData(graphSpec_Celarbo: GraphSpec_Celarbo): GraphData {
        const nodes: GraphNode[] = [];
        const links: NamedGraphLink[] = [];

        const verticalSpacing = 100;
        const horizontalSpacing = 100;

        // ATTENTION: maintenance 
        const groupLabels: Greek[] = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
        const groupOfLevel = (level: number): GroupType => {
            if (level >= groupLabels.length) {
                throw new Error(`Level ${level} exceeds available group labels.`);
            }
            return groupLabels[level];
        };

        const nodeIndex = 0;

        const traverse = (
            celarbo: _GraphSpec_Celarbo,
            level: number,
            xOffset: number,
            parentId?: string
        ): { width: number; centerX: number } => {
            const nodeId = celarbo.name;
            const group = groupOfLevel(level);
            const y = -level * verticalSpacing + 200;

            // If it's a leaf node ('category'), treat as having no children
            const isLeaf = celarbo.branches === 'category' || celarbo.branches.length === 0;

            if (isLeaf) {
                const x = xOffset;
                nodes.push({
                    id: nodeId,
                    val: 5,
                    group,
                    fx: x,
                    fy: y,
                    fz: 0,
                });
                if (parentId) {
                    links.push({
                        source: parentId,
                        target: nodeId,
                        name: `${parentId}_${nodeId}`,
                    });
                }
                return { width: horizontalSpacing, centerX: x };
            }

            // Recursively layout children
            const childResults = (celarbo.branches as _GraphSpec_Celarbo[]).map((child, i) =>
                traverse(child, level + 1, xOffset + i * horizontalSpacing)
            );

            const totalWidth = childResults.reduce((acc, r) => acc + r.width, 0);
            const centerX = childResults.length === 1
                ? childResults[0].centerX
                : (childResults[0].centerX + childResults[childResults.length - 1].centerX) / 2;

            nodes.push({
                id: nodeId,
                val: 10,
                group,
                fx: centerX,
                fy: y,
                fz: 0,
            });

            if (parentId) {
                links.push({
                    source: parentId,
                    target: nodeId,
                    name: `${parentId}_${nodeId}`,
                });
            }

            // Link parent to children
            for (const child of celarbo.branches as _GraphSpec_Celarbo[]) {
                links.push({
                    source: nodeId,
                    target: child.name,
                    name: `${nodeId}_${child.name}`,
                });
            }

            return { width: totalWidth || horizontalSpacing, centerX };
        };

        traverse(graphSpec_Celarbo.spec, 0, 0);

        console.log('nodes.length', nodes.length);
        console.log('links.length', links.length);

        return { nodes, links };
    }

    getNodeThreeObject(node: NodeObject<GraphNode>, message: string): THREE.Object3D {
        const group = new THREE.Group();

        // 🎯 Base node size scaling
        let baseSize = Math.cbrt(node.val ?? 1) * 10;

        // 🔷 Determine shape and color
        let mesh: THREE.Object3D;

        if (node.group === 'Epsilon') {
            // const geometry = new THREE.TetrahedronGeometry(baseSize, 0);
            baseSize *= 0.5;
            const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
            const material = new THREE.MeshLambertMaterial({
                color: 'red' //activeStates.isDeltaActive ? 'green' : 'red'
            });
            mesh = new THREE.Mesh(geometry, material);
        } else {
            const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
            const material = new THREE.MeshLambertMaterial({
                // color: node.id === activeAlphaId ? 'yellow' : 'red'
                color: message.includes(node.id) ? 'yellow' : 'red'
            });
            mesh = new THREE.Mesh(geometry, material);
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

}

export class FooSpace extends Space<GraphSpec_Foo> {

    constructor(graphSpec_Foo: GraphSpec_Foo) {
        super(graphSpec_Foo);
    }

    protected generateGraphData(graphSpec_Foo: GraphSpec_Foo): GraphData {
        const nodes: GraphNode[] = graphSpec_Foo.spec.map((id, idx) => ({
            id,
            val: 5,
            group: 'Alpha',
            fx: idx * 50, // space nodes along x-axis
            fy: 0,
            fz: 0,
        }));

        const links: NamedGraphLink[] = [];
        for (let i = 0; i < graphSpec_Foo.spec.length - 1; i++) {
            links.push({
                source: graphSpec_Foo.spec[i],
                target: graphSpec_Foo.spec[i + 1],
                name: `${graphSpec_Foo.spec[i]}_${graphSpec_Foo.spec[i + 1]}`,
            });
        }

        return { nodes, links };
    }

    getNodeThreeObject(node: NodeObject<GraphNode>, message: string): THREE.Object3D {

        const group = new THREE.Group();

        // 🎯 Base node size scaling
        const baseSize = Math.cbrt(node.val ?? 1) * 10;

        // 🔷 Determine shape and color
        const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
        const material = new THREE.MeshLambertMaterial({
            color: message.includes(node.id) ? 'yellow' : 'red'
        });
        const mesh = new THREE.Mesh(geometry, material);

        group.add(mesh);

        // 🏷️ Label sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const labelFontSize = 6;
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


}