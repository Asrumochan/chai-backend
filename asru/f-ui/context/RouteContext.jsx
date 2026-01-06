import React, { createContext } from 'react';

const RouteContext = createContext();

const RouteProvider = ({ children, basePath, userInfoHost, censusFile, censusAPIData, isLingoChatApiCalling, isDisableBUWSelection, isNewChat, setIsNewChat }) => {
    return (
        <RouteContext.Provider
            value={{
                basePath,
                userInfoHost,
                censusFile,
                censusAPIData,
                isLingoChatApiCalling,
                isDisableBUWSelection,
                isNewChat,
                setIsNewChat
            }}
        >
            {children}
        </RouteContext.Provider>
    );
};

export { RouteContext, RouteProvider };
