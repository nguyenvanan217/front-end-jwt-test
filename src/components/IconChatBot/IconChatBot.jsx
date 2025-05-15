import React, { useContext } from 'react';
import { FaRobot } from 'react-icons/fa';
import ChatBot from '../ChatBot/ChatBot';
import { ChatContext } from '../Context/chat.context';
import AuthContext from '../Context/auth.context';

const IconChatBot = () => {
    const { chatState, toggleBot } = useContext(ChatContext);
    const { auth } = useContext(AuthContext);
    const isOpen = chatState.isBotOpen;
    const isAdmin = auth?.user?.groupWithRoles?.group?.name?.includes('Quản Lý');

    return (
        <>
            <div
                className={`
                    fixed 
                    ${isAdmin ? 'bottom-12 sm:bottom-14' : 'bottom-24 sm:bottom-28'}
                    right-4 sm:right-[19px]
                    p-2 sm:p-3
                    bg-yellow-500 
                    rounded-full 
                    cursor-pointer 
                    hover:bg-yellow-600 
                    transition-colors 
                    shadow-lg 
                    z-[60]
                `}
                onClick={toggleBot}
            >
                <FaRobot className="text-white text-xl sm:text-2xl" />
            </div>
            {isOpen && <ChatBot isOpen={isOpen} onClose={toggleBot} />}
        </>
    );
};

export default IconChatBot;
