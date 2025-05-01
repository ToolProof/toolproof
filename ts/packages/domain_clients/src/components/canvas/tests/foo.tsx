import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

const radius = 200;
const distance = 100;
const alphaLength = 26;
const betaLength = 26;

const FRAME_DURATION = 1000 / 60;
const DESIRED_TRAVEL_MS = 500;

const alphaNodes = [...Array(alphaLength).keys()].map(i => {
    const angle = (2 * Math.PI * i) / alphaLength;
    return {
        id: 'Alpha_' + i,
        val: 5,
        group: i + 1,
        fx: radius * Math.cos(angle),
        fy: 0,
        fz: radius * Math.sin(angle)
    };
});

const alphaLinks = [...Array(alphaLength).keys()].flatMap(i => {
    const circumferenceNode = 'Alpha_' + i;
    return [
        { source: 'Alpha_Center', target: circumferenceNode },
        { source: circumferenceNode, target: 'Alpha_Center' }
    ];
});

const betaNodes = [...Array(betaLength).keys()].map(i => {
    const angle = (2 * Math.PI * i) / betaLength;
    return {
        id: 'Beta_' + i,
        val: 5,
        group: i + 1,
        fx: radius * Math.cos(angle),
        fy: distance,
        fz: radius * Math.sin(angle)
    };
});

const betaLinks = [...Array(betaLength).keys()].flatMap(i => {
    const circumferenceNode = 'Beta_' + i;
    return [
        { source: 'Beta_Center', target: circumferenceNode },
        { source: circumferenceNode, target: 'Beta_Center' }
    ];
});

const alphaBetaLinks = [...Array(alphaLength).keys()].flatMap(i => {
    const alphaCircumferenceNode = 'Alpha_' + i;
    const betaCircumferenceNode = 'Beta_' + i;
    return [
        { source: alphaCircumferenceNode, target: betaCircumferenceNode },
        { source: betaCircumferenceNode, target: alphaCircumferenceNode }
    ];
});

const data = {
    nodes: [
        { id: 'Alpha_Center', val: 50, group: 0, fx: 0, fy: 0, fz: 0 },
        { id: 'Beta_Center', val: 50, group: 0, fx: 0, fy: distance, fz: 0 },
        ...alphaNodes,
        ...betaNodes
    ],
    links: [...alphaLinks, ...betaLinks, ...alphaBetaLinks]
};

function computeSpeedForDuration(_link, desiredMs = DESIRED_TRAVEL_MS) {
    const speed = FRAME_DURATION / desiredMs;
    console.log('speed', speed);
    return speed;
}


export default function MyGraph() {
    const fgRef = useRef();
    const [activeNodeId, setActiveNodeId] = useState('0');

    useEffect(() => {
        let i = 0;
        let cancelled = false;

        function emitNext() {
            if (cancelled || !fgRef.current) return;

            const link = data.links[i % data.links.length];
            fgRef.current.emitParticle(link);
            setActiveNodeId(link.source.id ?? link.source); // support both node or ID
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
            nodeLabel="id"
            nodeVal="val"
            nodeColor={node =>
                node.id === activeNodeId ? 'yellow' : 'red'
            }
            linkOpacity={0.3}
            linkDirectionalParticles={0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={link => computeSpeedForDuration(link)}
            onNodeClick={node => console.log(node)}
        />
    );
}
