import { computeSpeedForDuration } from './utils';
import { GraphNode, NamedGraphLink, SpaceInterface } from './types';
import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

type FabricProps = {
    space: SpaceInterface;
    message: string;
}

export default function Fabric({ space, message }: FabricProps) {
    const fgRef = useRef();
    const [activeAlphaId, setActiveAlphaId] = useState<string | GraphNode>('AlphaSuper');
    const [activeBetaId, setActiveBetaId] = useState<string | GraphNode>('');
    const [isDeltaActive, setIsDeltaActive] = useState(false);
    const [isGammaActive, setIsGammaActive] = useState(false);

    useEffect(() => {
        if (fgRef.current) {
            // Set the camera position directly (x, y, z) and lookAt (default is origin

            const hack = fgRef.current as {
                cameraPosition: (position: { x: number, y: number, z: number }, lookAt?: { x: number, y: number, z: number }, transitionTime?: number) => void;
            }

            hack.cameraPosition(
                { x: 100, y: 100, z: 100 }, // Move the camera farther away from the center
                undefined,              // Look at center (default: {x: 0, y: 0, z: 0})
                0                      // Transition time (0 = immediate)
            );
        }
    }, []);


    /* const linkNames = data.links.map(link => link.name);
    console.log('linkNames', linkNames); */

    /* useEffect(() => {
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
    }, []); */

    return (
        <ForceGraph3D
            ref={fgRef}
            graphData={space.graphData}
            nodeLabel='id'
            nodeVal='val'
            nodeThreeObject={node => space.getNodeThreeObject(
                node,
                message,
            )}
            linkOpacity={0.3}
            linkDirectionalParticles={0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={link => computeSpeedForDuration()}
            onNodeClick={node => console.log(node)}
        />
    );

}
