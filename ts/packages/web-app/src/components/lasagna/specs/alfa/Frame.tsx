'use client'
import Painting from '@/components/lasagna/Painting';
import { sequence } from '@/components/lasagna/specs/alfa/specs';
import { useState, useRef, useEffect } from 'react';

export default function Frame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGlue, setShowGlue] = useState(false);
  const [sequenceDescription, setSequenceDescription] = useState('');
  const [z, setZ] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSequenceDescription(sequence[z][1]);
  }, [z]);

  const handleClickPrevious = () => {
    if (isPlaying) return;
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
    }, 1000);
  };

  const handleClickPlay = () => {
    if (isPlaying) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
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
    if (isPlaying) return;
    console.log('z', z);
    console.log('sequence.length', sequence.length);
    if (z < sequence.length - 1) {
      setZ(z + 1);
    } else {
      setZ(0);
    }
  }

  const headline = 'Welcome to a visualization of ToolProof Drug Discovery';
  const subHeadline = 'Rectangles indicate execution of business logic | Ellipses indicate static data storage | Color indicates where the code/data runs/resides';

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full text-center p-2 font-bold text-lg bg-white">
        {headline}
      </div>
      <div className="fixed top-4 left-0 w-full text-center p-4 font-bold text-[10px] bg-transparent">
        {subHeadline}
      </div>
      <Painting z={z} showGlue={showGlue} />
      {!isPlaying && (
        <div className="fixed bottom-20 left-0 w-full bg-transparent p-4 text-center">
          <p>{sequenceDescription}</p>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full flex p-4 bg-blue-50">
        <button
          className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setShowGlue((prev) => !prev)}
        >
          {showGlue ? 'Hide Glue' : 'Show Glue'}
        </button>
        <div className="flex-grow flex justify-center">
          <button
            className={`w-32 mx-2 px-4 py-2 bg-gray-300 rounded ${!isPlaying ? 'hover:bg-gray-400' : ''}`}
            onClick={handleClickPrevious}
          >
            Previous
          </button>
          <button className="w-32 mx-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleClickPlay}>{
            isPlaying ? 'Stop' : 'Play'
          }</button>
          <button
            className={`w-32 mx-2 px-4 py-2 bg-gray-300 rounded ${!isPlaying ? 'hover:bg-gray-400' : ''}`}
            onClick={handleClickNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
