'use client'
import Painting from '@/components/lasagna/Painting';
import { GraphElementNameType } from '@/components/lasagna/classes';
import { path } from '@/components/lasagna/specs';
import { useEffect, Dispatch, SetStateAction } from 'react';

interface FrameProps {
  counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
  pathDescription: string;
  setPathDescription: Dispatch<SetStateAction<string>>;
}

export default function Frame({ counter, setCounter, pathDescription, setPathDescription }: FrameProps) {

  useEffect(() => {
    setPathDescription(path[counter]?.[1] || '');
  }, [counter, setPathDescription]);

  const isElementActive = (key: GraphElementNameType) => {
    return path[counter]?.[0]?.includes(key) || false;
    // return key === activeElement;
    // return false;
  };

  const handleClickPrevious = () => {
    if (counter > 0) {
      setCounter(counter - 1);
    } else {
      setCounter(path.length - 1);
    }
  };

  const handleClickNext = () => {
    if (counter < path.length - 1) {
      setCounter(counter + 1);
    } else {
      setCounter(0);
    }
  };


  return (
    <div className='bg-transparent w-full h-full'>
      <Painting
        isElementActive={isElementActive}
        counter={counter}
      />
      <div className="fixed bottom-0 left-0 w-[600px] bg-transparent p-4 text-center">
        <p>{pathDescription}</p>
      </div>
      {<div className="fixed bottom-0 left-0 w-full flex p-4 bg-transparent justify-center">
        <div className="flex w-1/2 justify-end">
          <button
            className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
            onClick={handleClickPrevious}
          >
            Previous
          </button>
          <button
            className="w-32 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={handleClickNext}
          >
            Next
          </button>
        </div>
      </div>}
    </div>
  );
}