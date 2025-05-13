import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chatState, setChatState] = useState({
        isBotOpen: false,
        isMessengerOpen: false,
    });

    const toggleBot = () => {
        setChatState((prev) => ({
            isBotOpen: !prev.isBotOpen,
            isMessengerOpen: false, // Đóng messenger khi mở bot
        }));
    };

    const toggleMessenger = () => {
        setChatState((prev) => ({
            isBotOpen: false, // Đóng bot khi mở messenger
            isMessengerOpen: !prev.isMessengerOpen,
        }));
    };

    return <ChatContext.Provider value={{ chatState, toggleBot, toggleMessenger }}>{children}</ChatContext.Provider>;
};
