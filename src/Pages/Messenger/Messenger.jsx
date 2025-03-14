import React, { useState } from 'react';
import ListChat from './ListChat';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';

function Messenger() {
    const [message, setMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);

    // Mock data for messages
    const messagesByChat = {
        1: [
            {
                id: 1,
                sender: 'Nguyễn Văn A',
                content: 'Xin chào, tôi muốn mượn sách',
                timestamp: '12:30',
                isSender: false,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            },
            {
                id: 2,
                sender: 'You',
                content: 'Chào bạn, bạn muốn mượn sách gì ạ?',
                timestamp: '12:31',
                isSender: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
            },
            {
                id: 3,
                sender: 'Nguyễn Văn A',
                content: "Tôi muốn mượn sách 'Clean Code'",
                timestamp: '12:32',
                isSender: false,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            },
        ],
        2: [
            {
                id: 1,
                sender: 'Trần Thị B',
                content: 'Cảm ơn bạn đã giúp đỡ',
                timestamp: 'Hôm qua',
                isSender: false,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            },
        ],
        3: [
            {
                id: 1,
                sender: 'Lê Văn C',
                content: 'Khi nào sách về vậy?',
                timestamp: '10:15',
                isSender: false,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
            },
        ],
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && selectedChat) {
            
            setMessage('');
        }
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100">
            {/* Chat List */}
            <ListChat onSelectChat={handleChatSelect} selectedChatId={selectedChat?.id} />

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-300 flex items-center gap-3">
                            <img src={selectedChat.avatar} alt="Current chat" className="w-10 h-10 rounded-full" />
                            <div>
                                <h2 className="font-semibold">{selectedChat.name}</h2>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesByChat[selectedChat.id].map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2 ${msg.isSender ? 'flex-row-reverse' : ''}`}
                                >
                                    <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-full" />
                                    <div
                                        className={`max-w-[70%] ${
                                            msg.isSender
                                                ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg'
                                                : 'bg-white rounded-r-lg rounded-bl-lg'
                                        } p-3 shadow-sm`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="text-xs text-gray-400 mt-1 block">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-300">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                    <FaImage size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className={`p-2 rounded-full ${
                                        message.trim() ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400'
                                    } transition-colors`}
                                >
                                    <IoSend size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messenger;
