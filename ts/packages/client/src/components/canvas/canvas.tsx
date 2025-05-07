import { data, path } from './specs';
import { Node, NamedLink } from './types';
import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';


const FRAME_DURATION = 1000 / 60;
const DESIRED_TRAVEL_MS = 2000;


function computeSpeedForDuration(_link, desiredMs = DESIRED_TRAVEL_MS) {
    const speed = FRAME_DURATION / desiredMs;
    // console.log('speed', speed);
    return speed;
}


export default function Canvas() {
    const fgRef = useRef();
    const [activeAlphaId, setActiveAlphaId] = useState<string | Node>('AlphaSuper');
    const [activeBetaId, setActiveBetaId] = useState<string | Node>('');
    const [isDeltaActive, setIsDeltaActive] = useState(false);
    const [isGammaActive, setIsGammaActive] = useState(false);

    /* const linkNames = data.links.map(link => link.name);
    console.log('linkNames', linkNames); */

    useEffect(() => {
        let i = 0;
        let cancelled = false;

        function emitNext() {
            if (cancelled || !fgRef.current) return;

            if (i === path.length) {
                i = 6;
            }
            const linkNames = path.map(link => link.name);
            const linkName = linkNames[i];
            const link = data.links.find(l => l.name === linkName) as NamedLink; // ATTENTION
            fgRef.current.emitParticle(link);
            // console.log('link.source', link.source);
            if (path[i].switchAlpha === 1) {
                setActiveAlphaId(typeof link.source === 'string' ? link.source : link.source.id);
            }
            if (path[i].switchBeta === 1) {
                // console.log('link.source', link.source);
                setActiveBetaId(typeof link.source === 'string' ? link.source : link.source.id);
            } else if (path[i].switchBeta === -1) {
                setActiveBetaId('');
            }
            if (path[i].switchDelta === 1) {
                setIsDeltaActive(true);
            } else if (path[i].switchDelta === -1) {
                setIsDeltaActive(false);
            }
            if (path[i].switchGamma === 1) {
                setIsGammaActive(true);
            } else if (path[i].switchGamma === -1) {
                setIsGammaActive(false);
            }
            i++;

            setTimeout(emitNext, DESIRED_TRAVEL_MS);
        }

        // emitNext();
        return () => { cancelled = true; };
    }, []);

    return (
        <ForceGraph3D
            ref={fgRef}
            graphData={data}
            nodeLabel='id'
            nodeVal='val'
            nodeColor={node =>
                node.id === activeAlphaId ? 'yellow' : 'red'
            }
            nodeThreeObject={node => {
                const group = new THREE.Group();

                // 🎯 Base node size scaling
                let baseSize = Math.cbrt(node.val ?? 1) * 10;

                // 🔷 Determine shape and color
                let mesh: THREE.Object3D;

                if (node.group === 3) {
                    // 🟦 Delta node (tetrahedron)
                    // const geometry = new THREE.TetrahedronGeometry(baseSize, 0);
                    baseSize *= 0.5;
                    const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
                    const material = new THREE.MeshLambertMaterial({
                        color: isDeltaActive ? 'green' : 'red'
                    });
                    mesh = new THREE.Mesh(geometry, material);
                } else if (node.group === 2) {
                    // 🟩 Gamma node (cube)
                    baseSize *= 0.5;
                    const geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize);
                    const material = new THREE.MeshLambertMaterial({
                        color: isGammaActive ? 'green' : 'red'
                    });
                    mesh = new THREE.Mesh(geometry, material);
                } else if (node.group === 1) {
                    // 🔵 Beta node (cone)
                    const radius = baseSize * 0.4;
                    const height = baseSize;
                    const geometry = new THREE.ConeGeometry(radius, height, 16);
                    const material = new THREE.MeshLambertMaterial({
                        color: node.id === activeBetaId ? 'blue' : 'red'
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = Math.PI / 1;
                } else if (node.group === 0) {
                    // 🟡 Alpha node (sphere)
                    const geometry = new THREE.SphereGeometry(baseSize / 2, 16, 16);
                    const material = new THREE.MeshLambertMaterial({
                        color: node.id === activeAlphaId ? 'yellow' : 'red'
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
            }}
            linkOpacity={0.3}
            linkDirectionalParticles={0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={link => computeSpeedForDuration(link)}
            onNodeClick={node => console.log(node)}
        />
    );

}
