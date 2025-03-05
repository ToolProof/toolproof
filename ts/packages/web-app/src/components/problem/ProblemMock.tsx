import { resourceDescriptions } from '../lasagna/texts/textsEng';
import { resourceDescriptions as resourceDescriptionsNor } from '../lasagna/texts/textsNor';
import { useState, useEffect, useRef } from 'react';

interface ProblemMockProps {
    counter: number;
    isNor: boolean;
}

export default function ProblemMock({ counter, isNor }: ProblemMockProps) {
    const [displayText, setDisplayText] = useState('');
    const prevCounterRef = useRef(counter); // Using useRef to persist previous counter value

    useEffect(() => {
        setDisplayText('');
        prevCounterRef.current = counter; // Update previous counter after render
    }, [counter]);

    const handleClick = (resource: string) => {
        if (isNor) {
            setDisplayText(resourceDescriptionsNor[resource]);
        } else {
            setDisplayText(resourceDescriptions[resource]);
        }
    };

    const foo = (counter: number): number => {
        switch (counter) {
            case 0: return 0;
            case 1: return 2;
            case 2: return 2;
            case 3: return 3;
            case 4: return 3;
            case 5: return 4;
            case 6: return 4;
            case 7: return 5;
            default: return 5; // Prevents undefined results
        }
    };

    const bar = (counter: number): number[] => {
        switch (counter) {
            case 0: return [];
            case 1: return [0, 1];
            case 2: return [0, 1];
            case 3: return [2];
            case 4: return [2];
            case 5: return [3];
            case 6: return [3];
            case 7: return [4];
            default: return [4]; // Prevents undefined results
        }
    };

    const currentCount = foo(counter);
    const highlightedItems = bar(counter); // Get indices of items to be highlighted

    const resources = Object.keys(resourceDescriptions);

    return (
        <div className='flex flex-col items-center w-full h-full p-4 bg-transparent'>
            <ul className='list-none p-0'>
                {resources.slice(0, currentCount).map((resource, index) => (
                    <li
                        key={resource}
                        onClick={() => handleClick(resource)}
                        className={`cursor-pointer p-2 m-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 transition-colors 
                        ${highlightedItems.includes(index) ? 'border-4 border-black' : ''}`}
                    >
                        {resource}
                    </li>
                ))}
            </ul>
            <p className='mt-24'>{displayText}</p>
        </div>
    );
}