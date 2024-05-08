'use client';
import ConceptDisplay from '@/components/ConceptDisplay';
import ConceptInput from '@/components/ConceptInput';
import { useConcept } from '@/lib/firestoreHelpersClient';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
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
            <div className='w-full bg-[#80807a]'>
                <ConceptInput concept={concept} />
            </div>
        </div>
    );

}