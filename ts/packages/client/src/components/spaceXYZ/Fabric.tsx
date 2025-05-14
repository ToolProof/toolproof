import { getGraphData, getNodeThreeObject, computeSpeedForDuration, path } from './utils';
import { Node, NamedLink, GraphSpec } from './types';
import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';


type FabricProps = {
    graphSpec: GraphSpec[];
    message: string;
}

export default function Fabric({ graphSpec, message }: FabricProps) {
    const fgRef = useRef();
    const [activeAlphaId, setActiveAlphaId] = useState<string | Node>('AlphaSuper');
    const [activeBetaId, setActiveBetaId] = useState<string | Node>('');
    const [isDeltaActive, setIsDeltaActive] = useState(false);
    const [isGammaActive, setIsGammaActive] = useState(false);

    const graphData = getGraphData(graphSpec);

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
            graphData={graphData}
            nodeLabel='id'
            nodeVal='val'
            nodeThreeObject={node => getNodeThreeObject(
                node,
                {
                    activeAlphaId,
                    activeBetaId,
                    isDeltaActive,
                    isGammaActive,
                },
                message,
            )}
            linkOpacity={0.3}
            linkDirectionalParticles={0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={link => computeSpeedForDuration(link)}
            onNodeClick={node => console.log(node)}
        />
    );

}
