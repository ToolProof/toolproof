'use client'
import Painting from '@/components/lasagna/Painting';
import { GraphElementNameType, Resource, ArrowWithConfig } from '@/components/lasagna/classes';
import { useState, useRef, useEffect } from 'react';

export default function Frame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBeta, setShowBeta] = useState(false);
  const [pathDescription, setPathDescription] = useState('');
  const [z, setZ] = useState(0);
  const [specs, setSpecs] = useState({
    resources: {} as Record<string, Resource>,
    arrowsWithConfig: {} as Record<string, ArrowWithConfig>,
    path: [] as Array<[GraphElementNameType[], string]>,
    gridSize: 0,
    cellWidth: 0,
    cellHeight: 0,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const importSpecs = async () => {
      const specsModule = showBeta
        ? await import('./specs/beta/specs')
        : await import('./specs/alpha/specs');
      setSpecs({
        resources: specsModule.resources,
        arrowsWithConfig: specsModule.arrowsWithConfig,
        path: specsModule.path,
        gridSize: specsModule.gridSize,
        cellWidth: specsModule.cellWidth,
        cellHeight: specsModule.cellHeight,
      });
    };

    importSpecs();
  }, [showBeta]);

  useEffect(() => {
    setPathDescription(specs.path[z]?.[1] || '');
  }, [z, specs.path]);

  const isElementActive = (key: GraphElementNameType) => {
    return specs.path[z]?.[0]?.includes(key) || false;
  };

  const bar = () => {
    return z === 7;
  };

  const handleClickPrevious = () => {
    if (isPlaying) return;
    if (z > 0) {
      setZ(z - 1);
    } else {
      setZ(specs.path.length - 1);
    }
  };

  const playNext = () => {
    setZ((prevZ) => (prevZ < specs.path.length - 1 ? prevZ + 1 : 0));
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) {
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
    if (z < specs.path.length - 1) {
      setZ(z + 1);
    } else {
      setZ(0);
    }
  };

  const headline = 'Welcome to a visualization of ToolProof Drug Discovery' + (showBeta ? ' - Version 2' : ' - Version 1');
  const subHeadline = 'Rectangles indicate execution of business logic | Ellipses indicate static data storage | Color indicates where the code/data runs/resides';

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-full text-center p-2 font-bold text-lg bg-white">
        {headline}
      </div>
      <div className="fixed top-4 left-0 w-full text-center p-4 font-bold text-[10px] bg-transparent">
        {subHeadline}
      </div>
      <Painting
        resources={specs.resources}
        arrowsWithConfig={specs.arrowsWithConfig}
        path={specs.path}
        gridSize={specs.gridSize}
        cellWidth={specs.cellWidth}
        cellHeight={specs.cellHeight}
        checkIfActive={isElementActive}
        bar={bar}
        showBeta={showBeta}
      />
      {!isPlaying && (
        <div className="fixed bottom-20 left-0 w-full bg-transparent p-4 text-center">
          <p>{pathDescription}</p>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full flex p-4 bg-blue-50">
        <button
          className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setShowBeta((prev) => !prev)}
        >
          {showBeta ? 'Show V.1' : 'Show V.2'}
        </button>
        <div className="flex-grow flex justify-center">
          <button
            className={`w-32 mx-2 px-4 py-2 bg-gray-300 rounded ${!isPlaying ? 'hover:bg-gray-400' : ''}`}
            onClick={handleClickPrevious}
          >
            Previous
          </button>
          <button className="w-32 mx-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleClickPlay}>
            {isPlaying ? 'Stop' : 'Play'}
          </button>
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