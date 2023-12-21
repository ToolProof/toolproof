"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";

interface AlfaContextType {
    isAlfa: boolean;
    setIsAlfa: Dispatch<SetStateAction<boolean>>;
}

const AlfaContext = createContext<AlfaContextType>({
    isAlfa: true, // Default value for isAlfa
    setIsAlfa: (value: boolean | ((prevState: boolean) => boolean)) => {
        console.log("value: ", value);
    }, // Default value for setIsAlfa
});

export const useAlfa = () => useContext(AlfaContext);

export const AlfaProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [isAlfa, setIsAlfa] = useState(true);

    return (
        <AlfaContext.Provider value={{ isAlfa, setIsAlfa }}>
            {children}
        </AlfaContext.Provider>
    );
};
