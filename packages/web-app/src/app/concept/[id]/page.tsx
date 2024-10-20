'use client';
import ConceptDisplay from '@/components/ConceptDisplay';
import ConceptInput from '@/components/ConceptInput';
import { useConcept } from '@/lib/firestoreHelpersClient';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Props = {
    params: {
        id: string;
    }
}

export default function Concept({ params: { id } }: Props) {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || '';
    const router = useRouter();
    const { concept } = useConcept(id);

    useEffect(() => {
        if (!userEmail) {
            // Redirect to '/' if no user is signed in
            router.push('/');
        }
    }, [router, userEmail]);

    if (!concept) { // ATTENTION: find a better way to handle this
        return null;
    }

    return (
        <div className='flex flex-col h-full overflow-hidden'>
            <div className='flex-grow overflow-hidden bg-[#ffffff]'>
                <ConceptDisplay key={concept.id} concept={concept} />
            </div>
            <div className='flex justify-center items-center w-full'>
                <div className='w-[50%] bg-[#80807a] flex justify-center items-center'>
                    <ConceptInput concept={concept} />
                </div>
            </div>
        </div>
    );

}