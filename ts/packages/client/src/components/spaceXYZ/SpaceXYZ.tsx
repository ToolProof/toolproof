import Fabric from '@/components/spaceXYZ/Fabric';
import { GraphData, GraphSpec, Celarbo } from '@/components/spaceXYZ/types'
import { getGraphDataFromGraphSpecs, getGraphDataFromCelarbo } from '@/components/spaceXYZ/utils';
import { runGrafumilo } from '@/lib/spaceXYZ/actionGrafumilo';
import { runLigandokreado } from '@/lib/spaceXYZ/actionLigandokreado';
import { useState, useEffect } from 'react';


export default function SpaceXYZ() {
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [message, setMessage] = useState<string>('Start');

    // Viusualizes Celarbo
    /* useEffect(() => {
        const celarbo: Celarbo = {
            name: 'Vivplibonigo',
            branches: [
                {
                    name: 'Suferelimino',
                    branches: [
                        {
                            name: 'Malsanelimino',
                            branches: [
                                {
                                    name: 'Medikamentomalkovro',
                                    branches: [
                                        {
                                            name: 'Ligandokreado',
                                            branches: 'category'
                                        }
                                    ]
                                },
                            ]
                        },
                    ]
                },
                {
                    name: 'Bonfartsubteno',
                    branches: []
                },
            ]
        }

        const graphData = getGraphDataFromCelarbo(celarbo);
        setGraphData(graphData);
    }, []); */


    // Invokes Grafumilo
    useEffect(() => {
        const fetchData = async () => {
            const path0 = 'ts/packages/domain_graphs/src/graphs/meta/grafumilo.ts';
            const path1 = 'ts/packages/domain_graphs/src/graphs/ligandokreado.ts';
            try {
                const result = await runGrafumilo(path1);
                console.log('result:', JSON.stringify(result, null, 2));

                const nodes = result.nodes || [];
                // eslint-disable-next-line
                const graphSpecs: GraphSpec[] = nodes.map((node: any) => {
                    if (typeof node.content === 'string') {
                        return {
                            name: node.path,
                            tools: [],
                        };
                    }

                    const tools: string[] = (node.content.operations || [])
                        // eslint-disable-next-line
                        .filter((operation: any) => typeof operation.name === 'string')
                        // eslint-disable-next-line
                        .map((operation: any) => operation.name);

                    return {
                        name: node.content.name || node.path,
                        tools,
                    };
                });

                setGraphData(getGraphDataFromGraphSpecs(graphSpecs));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    // Invokes Ligandokreado
    /* useEffect(() => {
        if (message === 'Start' || message.includes('NodeEvaluateResults')) {
            runLigandokreado();
        }
    }, [message]); */


    // WebSocket Connection for Broadcast Messages
    /* useEffect(() => {
        const ws = new WebSocket('wss://service-tp-websocket-384484325421.europe-west2.run.app');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            setMessage(event.data);
            console.log('WebSocket Broadcast Received:', event.data);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }, []); */

    return (
        graphData && (
            <Fabric graphData={graphData} message={message} />
        )
    );

}
