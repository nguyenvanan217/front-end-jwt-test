import React from 'react';
import { IoChatbubbleEllipses } from 'react-icons/io5';

const IconChat = ({ onClick }) => {
    return (
        <div
            className="fixed bottom-10 right-4 bg-blue-500 rounded-full p-3 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
            onClick={onClick}
        >
            <IoChatbubbleEllipses className="text-white text-2xl" />
        </div>
    );
};

export default IconChat;