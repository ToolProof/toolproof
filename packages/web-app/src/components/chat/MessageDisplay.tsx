import { useState, useEffect } from 'react';
import { MessageRead } from 'shared/src/typings';
import { useAppDispatch } from '@/redux/hooks';
import { startTyping, stopTyping } from '@/redux/features/typewriterSlice';
import { useSession } from 'next-auth/react';

type Props = {
  message: MessageRead;
  isNew: boolean;
  onTextChange: (text: string) => void;
};

export default function MessageDisplay({ message, isNew, onTextChange }: Props) {
  const [displayedText, setDisplayedText] = useState('');
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userImg = session?.user?.image || '';
  const imageSource = (message.userId === userEmail) ? userImg : '/images/openai_logo.png';

  useEffect(() => {
    if (isNew) {
      onTextChange(displayedText);
      //console.log(message.userId);
    }
  }, [displayedText, isNew, onTextChange]);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isNew && message.userId === 'ChatGPT') {
      dispatch(startTyping());
      const typeLetter = (index: number) => {
        if (index < message.content.length) {
          const currentChar = message.content[index];
          const isPunctuation = ',.?!;:'.includes(currentChar);
          const delay = isPunctuation ? 25 : 5; // Longer delay for punctuation

          timeoutId = window.setTimeout(() => {
            setDisplayedText((currentText) => currentText + currentChar);
            typeLetter(index + 1);
          }, delay);
        } else {
          dispatch(stopTyping());
        }
      };
      typeLetter(0);
    } else {
      setDisplayedText(message.content);
    }

    // Cleanup function
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [message, isNew, dispatch]);

  return (
    <div className={`flex py-4 px-2 space-x-5 max-w-2xl mx-auto ${message.isMeta ? 'bg-gray-100' : ''}`}>
      <img src={imageSource} alt='' className='h-8 w-8' />
      <p className={`text-black ${message.isMeta ? 'italic text-gray-500' : ''}`}>{displayedText}</p>
    </div>
  );
}