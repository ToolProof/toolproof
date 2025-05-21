import { GraphSpec_ToolProof } from 'shared/src/types';
import { GraphSpec_Celarbo, SpaceInterface, ToolProofSpace, CelarboSpace } from '@/components/spaceXYZ/types';
import Fabric from '@/components/spaceXYZ/Fabric';
import { runGrafumilo } from '@/lib/spaceXYZ/actionGrafumilo';
import { runLigandokreado } from '@/lib/spaceXYZ/actionLigandokreado';
import { useState, useEffect } from 'react';

const foo = false; // Set to true to use the CelarboSpace, false for ToolProofSpace

export default function SpaceXYZ() {
    const [graphSpec, setGraphSpec] = useState<GraphSpec_Celarbo | GraphSpec_ToolProof | null>(null);
    const [space, setSpace] = useState<SpaceInterface | null>(null);
    const [message, setMessage] = useState<string>('Start');

    // Fetch GraphSpecs 
    useEffect(() => {
        if (foo) {
            const celarbo: GraphSpec_Celarbo = {
                spec: {
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
                },
            }
            setGraphSpec(celarbo);
        } else {
            const fetchData = async () => {
                const path0 = 'ts/packages/domain_graphs/src/graphs/meta/grafumilo.ts';
                const path1 = 'ts/packages/domain_graphs/src/graphs/ligandokreado.ts';
                try {
                    const result = await runGrafumilo(path1);
                    console.log('graphSpec:', JSON.stringify(result.graphSpec, null, 2));
                    setGraphSpec(result.graphSpec as GraphSpec_ToolProof);
                } catch (error) {
                    throw new Error(`Error fetching data: ${error}`);
                }
            };

            fetchData();
        }
    }, []);


    // Instantiate Space
    useEffect(() => {
        if (!graphSpec) return;
        if (foo) {
            const celarboSpace = new CelarboSpace(graphSpec as GraphSpec_Celarbo);
            setSpace(celarboSpace);
        } else {
            const toolProofSpace = new ToolProofSpace(graphSpec as GraphSpec_ToolProof);
            setSpace(toolProofSpace);
        }
    }, [graphSpec]);


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
        (space) && (
            <Fabric space={space} message={message} />
        )
    );

}
