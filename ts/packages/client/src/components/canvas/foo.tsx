'use client'
import Canvas from '@/components/canvas/canvas';
import { RawData } from '@/components/canvas/types';
import { runRemoteGraph } from '@/lib/chat/fooAction';
import { useState, useEffect } from 'react';


export default function Foo() {
    const [rawData, setRawData] = useState<RawData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await runRemoteGraph();
                console.log('result:', JSON.stringify(result, null, 2));

                const nodes = result.nodes || [];
                const extractedData: RawData[] = nodes.map((node: any) => {
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

    return <Canvas rawData={rawData} />;
}
