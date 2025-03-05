'use client'
import Painting from '@/components/lasagna/Painting';
import { GraphElementNameType } from '@/components/lasagna/classes';
import { path } from '@/components/lasagna/specs';
import { path as pathNor } from '@/components/lasagna/specsNor';
import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';

interface FrameProps {
  counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
  pathDescription: string;
  setPathDescription: Dispatch<SetStateAction<string>>;
  isNor: boolean;
}

export default function Frame({ counter, setCounter, pathDescription, setPathDescription, isNor }: FrameProps) {
  const [showStandin, setshowStandin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeElement, setActiveElement] = useState<GraphElementNameType | null>(null);
  const [lastActiveElement, setLastActiveElement] = useState<GraphElementNameType | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (isNor) {
      setPathDescription(pathNor[counter]?.[1] || '');
    } else {
      setPathDescription(path[counter]?.[1] || '');
    }
  }, [counter, isNor, setPathDescription]);

  const isElementActive = (key: GraphElementNameType) => {
    return path[counter]?.[0]?.includes(key) || false;
    // return key === activeElement;
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

  const playNext = () => {
    setCounter((prevCounter) => (prevCounter < path.length - 1 ? prevCounter + 1 : 0));
    timeoutRef.current = setTimeout(() => {
      if (timeoutRef.current) {
        playNext();
      }
    }, 1000);
  };

  /* const playNext = useCallback(() => {
    console.log('activeElement', activeElement);
    if (activeElement === null) {
      setActiveElement('Humans');
      setLastActiveElement(null);
    } else if (activeElement === 'AI' || activeElement === 'Tools' || activeElement === 'Data') {
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
  }, [activeElement]); */

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

  /* useEffect(() => {
    // return;
    setIsPlaying(true);
    timeoutRef.current = setTimeout(playNext, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [playNext]); */

  let headline = 'Welcome to a visualization of ToolProof Drug Discovery' + (showStandin ? ' - Version 2' : ' - Version 1');
  let subHeadline = 'Rectangles indicate code | Diamonds indicate code that runs AI | Ellipses indicate data storage | Color indicates where the code/data runs/resides';

  let buttonPrevious = 'Previous';
  let buttonNext = 'Next';

  if (isNor) {
    headline = 'Velkommen til en visualisering av ToolProof Drug Discovery (alle elementer kan klikkes på for informasjon)';
    subHeadline = 'Rektangler = kode | Diamanter = KI (AI) | Ellipser = datalagring | Farge indikerer hvor koden/datalagringen kjører/oppholder seg | NB: Fremstillingen er noe teknisk';
    buttonPrevious = 'Forrige';
    buttonNext = 'Neste';
  }


  return (
    <div className='bg-transparent w-full h-full'>
      <div className="fixed top-0 left-0 w-full text-center p-2 font-bold text-lg bg-white">
        {headline}
      </div>
      <div className="fixed top-6 left-0 w-full text-center p-4 text-xs bg-transparent">
        {subHeadline}
      </div>
      <Painting
        isElementActive={isElementActive}
        counter={counter}
        showStandin={showStandin}
        isNor={isNor}
      />
      !isPlaying && (
      <div className="fixed bottom-14 right-0 w-[600px] bg-transparent p-4 text-center">
        <p>{pathDescription}</p>
      </div>
      )
      <div className="fixed bottom-0 left-0 w-full flex p-4 bg-transparent justify-center">
        <div className="flex w-1/2 justify-end">
          {!isNor && (
            <button
              className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
              onClick={() => setshowStandin((prev) => !prev)}
            >
              {showStandin ? 'Show V.1' : 'Show V.2'}
            </button>
          )}
          <button
            className={`w-32 px-4 py-2 bg-gray-300 rounded ${!isPlaying ? 'hover:bg-gray-400' : ''} mr-2`}
            onClick={handleClickPrevious}
          >
            {buttonPrevious}
          </button>
          <button
            className={`w-32 px-4 py-2 bg-gray-300 rounded ${!isPlaying ? 'hover:bg-gray-400' : ''}`}
            onClick={handleClickNext}
          >
            {buttonNext}
          </button>
        </div>
      </div>
    </div>
  );
}