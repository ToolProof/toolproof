'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';

type Props = {
    fileName: string;
    selectedOption: string;
}

export default function FileRow({ fileName, selectedOption }: Props) {
    const pathName = usePathname();
    const [active, setActive] = useState(false);
    const href = `/file/${fileName}`;

    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(fileName));
    }, [pathName, fileName]);

    return (
        <div
            className={`relative flex items-center justify-between space-x-2 px-3 py-1 rounded-2xl 
            text-sm cursor-pointer text-gray-300 
            ${active ? 'bg-slate-400' : 'bg-slate-500'}
            `}
        >
            <Link href={href} passHref className='flex-1'>
                <div className='flex-1 flex space-x-4'>
                    <p className='flex-1 hover:opacity-50 hidden md:inline-flex truncate'>
                        {fileName}
                    </p>
                </div>
            </Link>
            <TrashIcon
                className='h-6 w-6 text-gray-700 hover:text-red-700'
                onClick={(e) => {
                    e.stopPropagation(); // Prevent Link navigationyy
                }}
            />
        </div>
    );
}
