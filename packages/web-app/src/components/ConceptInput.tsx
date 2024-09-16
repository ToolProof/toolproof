'use client'
import * as Constants from 'shared/src/constants'
import { ConceptRead } from 'shared/src/typings';
import sendPromptAction from '@/lib/sendPromptAction';
import { addMessage } from '@/lib/firestoreHelpersClient';
import { useAppSelector } from '@/redux/hooks';
import { useState, useEffect, useRef } from 'react';
// import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faArrowUp } from '@fortawesome/free-solid-svg-icons';


type Props = {
    concept: ConceptRead;
};


export default function ConceptInput({ concept }: Props) {
    const [input, setInput] = useState('');
    const turnState = concept?.turnState;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { data: session } = useSession();
    //const router = useRouter();
    // const toastIdRef = useRef<string | undefined>(undefined);
    const userEmail = session?.user?.email || '';
    const userName = session?.user?.name || '';
    const isTyping = useAppSelector(state => state.typewriter.isTyping);


    const submissionHelper = async () => {
        const content = input.trim();
        setInput('');
        const userMessage = await addMessage(concept.id, { userId: userEmail, content: content, tags: [Constants.test] });

        return;

        const data = await sendPromptAction({ conceptId: concept.id, promptSeed: content, userName, userMessage }); // ATTENTION: message order not secured
        if (data && data.topicDetected && data.action) {
            /*
                * Could interact with the Redux store here
            */
            console.log('topicDetected', data.topicDetected);
            console.log('action', data.action);
        } else {
            console.log('No topic detected or action found');
        }

    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to stop new line in textarea
            submissionHelper();
        }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submissionHelper();
    };


    const updateInputHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = parseInt(window.getComputedStyle(textarea).maxHeight, 10);
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
        }
    };

    useEffect(() => {
        updateInputHeight();
    }, [input]);

    // Adding useEffect for window resize
    useEffect(() => {
        const handleResize = () => {
            updateInputHeight();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array ensures this effect runs only once on mount


    useEffect(() => { // ATTENTION: should we use LayoutEffect?
        if (turnState === -1) {
            // toastIdRef.current = toast.loading('ConceptGPT is thinking...');
        } else {
            /* if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            } */
            textareaRef.current?.focus();
        }
        /* return () => {
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        }; */
    }, [turnState]);


    const renderHelper = (criterion: boolean) => {
        return (
            <form
                onSubmit={handleSubmit}
                className='flex flex-col items-center w-full bg-[#ffffff] p-4 sm:p-8'>
                {/* Add a relative container around the textarea and button */}
                <div className='relative w-full'>
                    <textarea
                        ref={textareaRef}
                        className='w-full resize-none max-h-[50vh] py-3 pr-[6rem] pl-3 outline-none rounded-full bg-[#eae8e8] overflow-x-hidden overflow-y-auto'
                        disabled={criterion}
                        placeholder='Type your message here...'
                        value={input}
                        rows={1}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                                        <button
                        style={{ position: 'absolute', right: '2rem', bottom: '0.75rem' }} // Adjust position relative to the new container
                        className={`p-2 rounded-full
                        ${!input ? 'disabled:cursor-not-allowed' : 'hover:opacity-50'}
                        ${!input ? 'bg-gray-300' : 'bg-black'}`}
                        disabled={!input}
                        type='submit'
                    >
                        {
                            (criterion || isTyping) ? (
                                <div className='flex justify-center items-center w-4 h-4 bg-transparent'>
                                    <FontAwesomeIcon icon={faCircle} className="text-white" />
                                </div>
                            ) : (
                                <div className='flex justify-center items-center w-4 h-4'>
                                    <FontAwesomeIcon icon={faArrowUp} className="text-white" />
                                </div>
                            )
                        }
                    </button>
                </div>
            </form>
        )
    }

    return renderHelper(turnState === -1);

}