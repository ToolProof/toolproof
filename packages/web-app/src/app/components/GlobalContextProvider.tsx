"use client";
import { createContext, useContext, useState } from "react";

interface GlobalContextType {
    isTyping: boolean;
    setIsTyping: (value: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType>({
    isTyping: false,
    setIsTyping: () => {}, // Simpler placeholder function
});


export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalContextProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [isTypingLocal, setIsTypingLocal] = useState(false);

    return (
        <GlobalContext.Provider value={{ isTyping: isTypingLocal, setIsTyping: setIsTypingLocal }}>
            {children}
        </GlobalContext.Provider>
    );
};
