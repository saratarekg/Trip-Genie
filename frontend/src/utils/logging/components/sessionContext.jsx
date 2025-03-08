import  { React, createContext, useContext } from "react";
import {useSessionTracker} from "@/utils/logging/sessionTracker.js";

const SessionContext = createContext();

export const useSession = () => {
    return useContext(SessionContext);
};

export const SessionProvider = ({ userId, children }) => {
    const { logInteraction, endSession } = useSessionTracker(userId);

    return (
        <SessionContext.Provider value={{ logInteraction, endSession }}>
            {children}
        </SessionContext.Provider>
    );
};