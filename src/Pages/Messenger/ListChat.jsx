import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function ListChat({ onSelectChat, selectedChatId }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for chat list
    const chatList = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            lastMessage: 'Xin chào, tôi muốn mượn sách',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            unread: 2,
            lastTime: '12:30',
        },
        {
            id: 2,
            name: 'Trần Thị B',
            lastMessage: 'Cảm ơn bạn đã giúp đỡ',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            unread: 0,
            lastTime: 'Hôm qua',
        },
        {
            id: 3,
            name: 'Lê Văn C',
            lastMessage: 'Khi nào sách về vậy?',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
            unread: 1,
            lastTime: '10:15',
        },
    ];

    const filteredChats = chatList.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
                        onClick={() => onSelectChat(chat)}
                        className={`flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                            ${selectedChatId === chat.id ? 'bg-gray-100' : ''}`}
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
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
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ListChat;
