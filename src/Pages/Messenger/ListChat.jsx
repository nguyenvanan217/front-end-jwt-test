import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function ListChat({ handleChatSelect, selectedChatId, chatList, isAdmin, userId }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [adminChatList, setAdminChatList] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            setAdminChatList(true);
        }
    }, [isAdmin]);

    const filteredChats = chatList.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getLastMessageDisplay = (chat) => {
        const isSender = chat.lastSenderId === userId; // Kiểm tra xem bạn có phải người gửi cuối không
        const hasImage = !!chat.lastImageUrl; // Kiểm tra xem tin nhắn cuối có ảnh không
        const hasContent = chat.lastMessage && chat.lastMessage.trim() !== ''; // Kiểm tra xem có nội dung văn bản không

        if (isSender) {
            // Tin nhắn cuối do bạn gửi
            if (hasImage && !hasContent) {
                return 'Bạn: đã gửi một ảnh';
            }
            return `Bạn: ${chat.lastMessage}`;
        } else {
            // Tin nhắn cuối do người khác gửi
            if (hasImage && !hasContent) {
                return `${chat.name}: đã gửi một ảnh`;
            }
            return `${chat.name}: ${chat.lastMessage}`;
        }
    };

    return (
        <div className="w-[300px] h-[calc(100vh-64px)] bg-white border-r border-gray-300">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-300">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <FaSearch className="absolute left-4 top-3 text-gray-400" />
                </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto h-[calc(100vh-144px)]">
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                            ${selectedChatId === chat.id ? 'bg-gray-100' : ''}`}
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-white font-bold">
                                {chat.avatar.startsWith('http') ? (
                                    <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full" />
                                ) : (
                                    chat.avatar
                                )}
                            </div>
                            {chat.unread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {chat.unread}
                                </span>
                            )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-800">{chat.name}</h3>
                                <span className="text-xs text-gray-500">{chat.lastTime}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {getLastMessageDisplay(chat)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ListChat;