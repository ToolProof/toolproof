'use client'
import Lasagna from '@/components/lasagna/Lasagna';
import { sequence } from '@/components/lasagna/constants';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [playButtonText, setPlayButtonText] = useState<'Play' | 'Stop'>('Play');
  const [detailsText, setDetailsText] = useState('');
  const [z, setZ] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDetailsText(sequence[z][1]);
  }, [z]);

  const handleClickPrevious = () => {
    if (z > 0) {
      setZ(z - 1);
    } else {
      setZ(sequence.length - 1);
    }
  }

  const playNext = () => {
    setZ((prevZ) => (prevZ < sequence.length - 1 ? prevZ + 1 : 0));
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) { // Ensures it stops when cleared
        playNext();
      }
    }, 100);
  };

  const handleClickPlay = () => {
    if (playButtonText === 'Stop') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setPlayButtonText('Play');
    } else {
      setPlayButtonText('Stop');
      timeoutRef.current = setTimeout(playNext, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleClickNext = () => {
    console.log('z', z);
    console.log('sequence.length', sequence.length);
    if (z < sequence.length - 1) {
      setZ(z + 1);
    } else {
      setZ(0);
    }
  }

  return (
    <div className="relative">
      {/* <div className="fixed top-0 left-0 w-full text-center p-4 text-xl font-bold">
        ToolProof Drug Discovery
      </div>
      <div className="fixed top-0 left-0 p-4 text-xs" style={{ marginTop: '3rem' }}>
        <p><b>Shape indicates <em>nature</em> (what the resource is)</b></p>
        <ul>
          <li>Rectangle means execution of business logic</li>
          <li>Ellipse means static data storage</li>
        </ul>
        <br />
        <p><b>Color indicates <em>platform</em> (where the code/data runs/resides)</b></p>
        <ul>
          <li>Red means LangGraph Platform</li>
          <li>Blue means Google Cloud Platform</li>
          <li>Green means Vercel-hosted web-application</li>
        </ul>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <p><b>Problem: moving data between LangGraph Platform and GCP Cloud Storage</b></p>
        <ul>
          <li>LangGraph Platform&apos;s managed environment offers limited flexibility w.r.t third-party code</li>
          <li>Maybe we need intermediate workers, as indicated by the <em>small</em> blue rectangles</li>
          <li>These workers could be implemented by Python-scripts hosted on GCP Cloud Run</li>
          <li>They will convert data in various file formats to JSON, and feed it to the Agent via a Rest API</li>
        </ul>
      </div> */}
      <div className="fixed top-0 right-0 p-4">

      </div>
      <Lasagna z={z} />
      <div className="fixed bottom-20 left-0 w-full bg-transparent p-4 text-center">
        <p>{detailsText}</p>
      </div>
      <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 bg-blue-50">
        <button className="mx-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleClickPrevious}>Previous</button>
        <button className="mx-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleClickPlay}>{playButtonText}</button>
        <button className="mx-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleClickNext}>Next</button>
      </div>
    </div>
  );
}
