"use client";
import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";

interface GlobalContextType {
    isAlfa: boolean;
    setIsAlfa: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContextType>({
    isAlfa: true, // Default value for isAlfa
    setIsAlfa: (value: boolean | ((prevState: boolean) => boolean)) => {
        console.log("value: ", value);
    }, // Default value for setIsAlfa
});

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalContextProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [isAlfaLocal, setIsAlfaLocal] = useState(true);

    return (
        <GlobalContext.Provider value={{ isAlfa: isAlfaLocal, setIsAlfa: setIsAlfaLocal }}>
            {children}
        </GlobalContext.Provider>
    );
};
