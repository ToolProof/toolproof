import { useState, useEffect } from "react";
import { MessageRead } from "shared/src/flow_0/typings";
import { useAppDispatch } from "@/lib/redux/hooks";
import { startTyping, stopTyping } from "@/lib/redux/features/typewriterSlice";


type Props = {
  message: MessageRead;
  isNew: boolean;
  onTextChange: (text: string) => void;
};


export default function MessageDisplay({ message, isNew, onTextChange }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const imageSource = (message.userId === "René") ? "/images/rene_stavnes.jpg" : "/images/openai_logo.png";
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isNew) {
      onTextChange(displayedText);
      //console.log(message.userId);
    }
  }, [displayedText, isNew, onTextChange]);


  useEffect(() => {
    let timeoutId: number | undefined;

    if (isNew && message.userId === "ChatGPT") {
      dispatch(startTyping());
      const typeLetter = (index: number) => {
        if (index < message.content.length) {
          const currentChar = message.content[index];
          const isPunctuation = ",.?!;:".includes(currentChar);
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
    <div className="flex py-5 px-0 space-x-5 max-w-2xl mx-auto">
      <img src={imageSource} alt="" className="h-8 w-8" />
      <p className="text-base">{displayedText}</p>
    </div>
  );

}