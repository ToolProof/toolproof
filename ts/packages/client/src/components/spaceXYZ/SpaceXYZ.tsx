'use client'
import Fabric from '@/components/spaceXYZ/Fabric';
import { NodeData } from '@/components/spaceXYZ/types';
import { runGrafumilo } from '@/lib/spaceXYZ/actionGrafumilo';
import { runLigandokreado } from '@/lib/spaceXYZ/actionLigandokreado';
import { useState, useEffect } from 'react';


export default function SpaceXYZ() {
    const [rawData, setRawData] = useState<NodeData[]>([]);
    const [message, setMessage] = useState<string>('Start');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await runGrafumilo();
                // console.log('result:', JSON.stringify(result, null, 2));

                const nodes = result.nodes || [];
                const extractedData: NodeData[] = nodes.map((node: any) => {
                    if (typeof node.content === 'string') {
                        return {
                            name: node.path,
                            tools: [],
                        };
                    }

                    const tools: string[] = (node.content.operations || [])
                        .filter((operation: any) => typeof operation.name === 'string')
                        .map((operation: any) => operation.name);

                    return {
                        name: node.content.name || node.path,
                        tools,
                    };
                });

                setRawData(extractedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (message === 'Start' || message.includes('NodeEvaluateResults')) {
            runLigandokreado();
        }
    }, [message]);


    // WebSocket Connection for Broadcast Messages
    useEffect(() => {
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
    }, []);



    return <Fabric rawData={rawData} message={message} />;
}
