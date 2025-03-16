import React, { useState, useContext, useEffect } from 'react';
import ListChat from './ListChat';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import AuthContext from '../../components/Context/auth.context';
import { getChatHistory, getAllChat } from '../../services/messengerService';

function Messenger() {
    const { auth } = useContext(AuthContext);
    const userId = auth?.user?.id;
    const isAdmin = auth?.user?.role === 'Admin';
    console.log('userId', userId);

    const [message, setMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageByChat, setMessageByChat] = useState([]);
    const [chatList, setChatList] = useState([]);
    const getAvatar = (user) => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return '?';
    };

    // Hàm chuyển đổi thời gian UTC sang giờ Việt Nam
    const formatTimeToVN = (utcTime) => {
        try {
            return new Date(utcTime).toISOString().slice(11, 16);
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    };

    const fetchAllMessage = async () => {
        try {
            // Sử dụng API khác nhau cho admin và user thường
            const response = isAdmin ? await getAllChat() : await getChatHistory(userId);
            console.log('fetchAllMessage response', response);

            // Lưu trữ toàn bộ tin nhắn gốc
            setMessageByChat(response.DT || []);

            // Transform messages into chat list format
            const transformedChats = [];
            const processedUsers = new Set();

            response.DT.forEach((chat) => {
                const otherUser = isAdmin
                    ? chat.sender_id === userId
                        ? chat.receiver
                        : chat.sender
                    : chat.sender_id === userId
                    ? chat.receiver
                    : chat.sender;

                // Chỉ thêm user chưa được xử lý
                if (!processedUsers.has(otherUser.id)) {
                    processedUsers.add(otherUser.id);
                    transformedChats.push({
                        id: chat.message_id,
                        userId: otherUser.id,
                        name: otherUser.username,
                        lastMessage: chat.content,
                        lastTime: new Date(chat.createdAt).toISOString().slice(11, 16),
                        avatar: getAvatar(otherUser),
                        unread: chat.status === 'Sent' ? 1 : 0,
                        createdAt: chat.createdAt,
                    });
                }
            });

            // Sort by latest message
            const sortedChats = transformedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setChatList(sortedChats);
        } catch (error) {
            console.log('fetchAllMessage error', error);
        }
    };

    useEffect(() => {
        fetchAllMessage();
    }, []);

    const handleChatSelect = (chat) => {
        console.log('Selected chat:', chat);
        setSelectedChat(chat);

        // Lọc tin nhắn của cuộc trò chuyện được chọn từ mảng gốc
        const selectedUserMessages = messageByChat
            .filter((message) => {
                return (
                    (message.sender_id === userId && message.receiver_id === chat.userId) ||
                    (message.sender_id === chat.userId && message.receiver_id === userId)
                );
            })
            .map((message) => ({
                id: message.message_id,
                sender: message.sender_id === userId ? 'You' : chat.name,
                content: message.content,
                timestamp: formatTimeToVN(message.createdAt),
                isSender: message.sender_id === userId,
                avatar:
                    message.sender_id === userId ? getAvatar({ username: 'You' }) : getAvatar({ username: chat.name }),
                createdAt: message.createdAt,
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Cập nhật tin nhắn cho cuộc trò chuyện được chọn
        setMessageByChat((prevState) => {
            // Tạo một bản sao của state hiện tại
            const newState = [...prevState];
            // Thêm các tin nhắn đã được lọc và format vào state
            selectedUserMessages.forEach((msg) => {
                if (!newState.find((m) => m.message_id === msg.id)) {
                    newState.push(msg);
                }
            });
            return newState;
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && selectedChat) {
            const now = new Date();
            const utcTime = now.toISOString();

            const newMessage = {
                message_id: Date.now(),
                sender_id: userId,
                receiver_id: selectedChat.userId,
                content: message,
                createdAt: utcTime,
                status: 'Sent',
                sender: {
                    id: userId,
                    username: 'You',
                },
                receiver: {
                    id: selectedChat.userId,
                    username: selectedChat.name,
                },
            };

            // Cập nhật messageByChat với tin nhắn mới
            setMessageByChat((prevMessages) => [...prevMessages, newMessage]);

            // Cập nhật chatList để hiển thị tin nhắn mới nhất
            setChatList((prevChats) => {
                const updatedChats = [...prevChats];
                const chatIndex = updatedChats.findIndex((chat) => chat.userId === selectedChat.userId);
                if (chatIndex !== -1) {
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        lastMessage: message,
                        lastTime: new Date(utcTime).toISOString().slice(11, 16),
                        createdAt: utcTime,
                    };
                }
                return updatedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });

            setMessage('');
        }
    };

    // Hiển thị tin nhắn cho cuộc trò chuyện được chọn
    const selectedChatMessages = selectedChat
        ? messageByChat
              .filter(
                  (msg) =>
                      (msg.sender_id === userId && msg.receiver_id === selectedChat.userId) ||
                      (msg.sender_id === selectedChat.userId && msg.receiver_id === userId),
              )
              .map((msg) => ({
                  id: msg.message_id,
                  content: msg.content,
                  timestamp: new Date(msg.createdAt).toISOString().slice(11, 16),
                  isSender: msg.sender_id === userId,
                  avatar:
                      msg.sender_id === userId
                          ? getAvatar({ username: 'You' })
                          : getAvatar({ username: selectedChat.name }),
              }))
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [];

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100">
            {/* Chat List */}
            <ListChat
                handleChatSelect={handleChatSelect}
                selectedChatId={selectedChat?.id}
                fetchAllMessage={fetchAllMessage}
                chatList={chatList}
                getAvatar={getAvatar}
            />

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-300 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-white font-bold">
                                {selectedChat.avatar.startsWith('http') ? (
                                    <img
                                        src={selectedChat.avatar}
                                        alt={selectedChat.name}
                                        className="w-full h-full rounded-full"
                                    />
                                ) : (
                                    selectedChat.avatar
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold">{selectedChat.name}</h2>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedChatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2 ${msg.isSender ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-white font-bold">
                                        {msg.avatar}
                                    </div>
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
