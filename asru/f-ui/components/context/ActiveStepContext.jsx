import React, { createContext, useState } from 'react';

export const ActiveStepContext = createContext();

export const ActiveStepProvider = ({ children }) => {
    const [activeStep, setActiveStep] = useState(-1);

    return (
        <ActiveStepContext.Provider value={{ activeStep, setActiveStep }}>
            {children}
        </ActiveStepContext.Provider>
    );
};