import React, { useState, useContext } from 'react';
import { FaRobot } from 'react-icons/fa';
import ChatBot from '../ChatBot/ChatBot';
import { ChatContext } from '../Context/chat.context';

const IconChatBot = () => {
    const { chatState, toggleBot } = useContext(ChatContext);
    const isOpen = chatState.isBotOpen;

    return (
        <>
            <div
                className="fixed bottom-24 right-4 bg-yellow-500 rounded-full p-3 cursor-pointer hover:bg-yellow-600 transition-colors shadow-lg z-[60]"
                onClick={toggleBot}
            >
                <FaRobot className="text-white text-2xl" />
            </div>
            {isOpen && <ChatBot isOpen={isOpen} onClose={toggleBot} />}
        </>
    );
};

export default IconChatBot;
