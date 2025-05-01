import React from 'react';
import { IoChatbubbleEllipses } from 'react-icons/io5';

const IconChat = ({ onClick, unreadCount = 0 }) => {
    return (
        <div
            className="fixed bottom-10 right-4 bg-blue-500 rounded-full p-3 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
            onClick={onClick}
        >
            <IoChatbubbleEllipses className="text-white text-2xl" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default IconChat;
