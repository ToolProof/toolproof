'use client';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMessages, deleteConcept } from '@/lib/firestoreHelpersClient';
import { ConceptRead } from 'shared/src/typings';

type Props = {
    concept: ConceptRead;
}

export default function ConceptRow({ concept }: Props) {
    const pathName = usePathname();
    const [active, setActive] = useState(false);
    const href = `/${concept.id}`;
    const { messages } = useMessages(concept.id);

    useEffect(() => {
        if (!pathName) return;
        setActive(pathName.includes(concept.id));
    }, [pathName, concept.id]);

    const handleDeleteConcept = async () => {
        try {
            await deleteConcept(concept.id);
            // console.log(`Concept with id ${concept.id} deleted`);
        } catch (error) {
            console.error(`Failed to delete concept: ${error}`);
        }
    }

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
                        {messages && messages.length > 0 ?
                            `${messages[0].content.slice(0, 20)}` :
                            'Empty Concept'}
                    </p>
                </div>
            </Link>
            <TrashIcon
                className='h-6 w-6 text-gray-700 hover:text-red-700'
                onClick={(e) => {
                    e.stopPropagation(); // Prevent Link navigation
                    handleDeleteConcept();
                }}
            />
        </div>
    );
}
