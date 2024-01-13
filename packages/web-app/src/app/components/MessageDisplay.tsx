import React, { useState, useEffect } from "react";
import { MessageRead } from "shared/typings";

type Props = {
  message: MessageRead;
  isNew: boolean;
  onTextChange: (text: string) => void;
};

function MessageDisplay({ message, isNew, onTextChange }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const imageSource = (message.userId === "René") ? "/images/rene_stavnes.jpg" : "/images/openai_logo.png";

  useEffect(() => {
    if (isNew) {
      onTextChange(displayedText);
      //console.log(message.userId);
    }
  }, [displayedText, isNew, onTextChange]);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isNew && message.userId === "ChatGPT") {
      const typeLetter = (index: number) => {
        if (index < message.content.length) {
          timeoutId = window.setTimeout(() => {
            setDisplayedText((currentText) => currentText + message.content[index]);
            typeLetter(index + 1);
          }, 10); // Adjust the typing speed here
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
  }, [message, isNew]);

  return (
    <div className="py-5 text-black">
      <div className="flex space-x-5 px-10 max-w-2xl mx-auto">
        <img src={imageSource} alt="" className="h-8 w-8"/>
        <p className="pt-1 text-base break-words whitespace-normal max-w-full">
          {displayedText}
        </p>
      </div>
    </div>
  );
}

export default MessageDisplay;