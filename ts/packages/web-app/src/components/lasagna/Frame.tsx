'use client'
import Painting from '@/components/lasagna/Painting';
import { GraphElementNameType, Node, EdgeWithConfig } from '@/components/lasagna/classes';
import { path, validTransitions } from '@/components/lasagna/specs/alpha/specs';
import { useState, useRef, useEffect, useCallback } from 'react';
import { set } from 'zod';

export default function Frame() {
  const [showAssistant, setshowAssistant] = useState(false);
  const [pathDescription, setPathDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [counter, setCounter] = useState(0);
  const [activeElement, setActiveElement] = useState<GraphElementNameType | null>(null);
  const [lastActiveElement, setLastActiveElement] = useState<GraphElementNameType | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    setPathDescription(path[counter]?.[1] || '');
  }, [counter]);

  const isElementActive = (key: GraphElementNameType) => {
    // return path[counter]?.[0]?.includes(key) || false;
    return key === activeElement;
  };

  const handleClickPrevious = () => {
    if (isPlaying) return;
    if (counter > 0) {
      setCounter(counter - 1);
    } else {
      setCounter(path.length - 1);
    }
  };

  const handleClickNext = () => {
    if (isPlaying) return;
    if (counter < path.length - 1) {
      setCounter(counter + 1);
    } else {
      setCounter(0);
    }
  };

  const playNext = useCallback(() => {
    console.log('activeElement', activeElement);
    if (activeElement === null) {
      setActiveElement('Humans');
      setLastActiveElement(null);
    } else if (activeElement.includes('_Dummy')) {
      const nextElement = activeElement ? activeElement.split('_').reverse().join('_') : 'Humans';
      setActiveElement(nextElement as GraphElementNameType);
      setLastActiveElement(activeElement);
    } else if (activeElement === 'AI' || activeElement === 'Tools') {
      const x = Math.floor(Math.random() * 3);
      const nextElement = validTransitions[activeElement][x];
      setActiveElement(nextElement);
      setLastActiveElement(activeElement);
    } else {
      const nextElement = validTransitions[activeElement][0];
      setActiveElement(nextElement);
      setLastActiveElement(activeElement);
    }
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) {
        playNext();
      }
    }, 1000);
  }, [activeElement]);

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
    return;
    setIsPlaying(true);
    timeoutRef.current = setTimeout(playNext, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [playNext]);

  const headline = 'Welcome to a visualization of ToolProof Drug Discovery' + (showAssistant ? ' - Version 2' : ' - Version 1');
  const subHeadline = 'Rectangles indicate execution of business logic | Ellipses indicate static data storage | Color indicates where the code/data runs/resides';

  return (
    <div className='bg-transparent w-full h-full'>
      {/* <div className="fixed top-0 left-0 w-full text-center p-2 font-bold text-lg bg-white">
        {true && files[0]?.path}
      </div>
      <div className="fixed top-4 left-0 w-full text-center p-4 font-bold text-[10px] bg-transparent">
        {false && subHeadline}
      </div> */}
      <Painting
        isElementActive={isElementActive}
        counter={counter}
        showAssistant={showAssistant}
      />
      {/*!isPlaying || false && (
        <div className="fixed bottom-20 left-0 w-full bg-transparent p-4 text-center">
          <p>{pathDescription}</p>
        </div>
      )*/}
      {/* <div className="fixed bottom-0 left-0 w-full flex p-4 bg-blue-50">
        <button
          className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setshowAssistant((prev) => !prev)}
        >
          {showAssistant ? 'Show V.1' : 'Show V.2'}
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
      </div> */}
    </div>
  );
}