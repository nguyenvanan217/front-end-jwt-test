import React from 'react';
import { IoChatbubbleEllipses } from 'react-icons/io5';

const IconChat = ({ onClick, unreadCount = 0 }) => {
    return (
        <div
            className={`
                fixed 
                bottom-10 sm:bottom-12
                right-4 sm:right-[19px]
                p-2 sm:p-3
                bg-blue-500 
                rounded-full 
                cursor-pointer 
                hover:bg-blue-600 
                transition-colors 
                shadow-lg
                z-[55]
            `}
            onClick={onClick}
        >
            <IoChatbubbleEllipses className="text-white text-xl sm:text-2xl" />
            {unreadCount > 0 && (
                <span
                    className="
                    absolute 
                    -top-2 sm:-top-2.5 
                    -right-1 sm:-right-1.5
                    bg-red-500 
                    text-white 
                    text-xs sm:text-sm
                    font-bold 
                    rounded-full 
                    min-w-[20px] sm:min-w-[24px]
                    h-5 sm:h-6
                    flex 
                    items-center 
                    justify-center 
                    px-1
                "
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default IconChat;
