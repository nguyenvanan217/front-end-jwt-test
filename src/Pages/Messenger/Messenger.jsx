import React, { useState, useContext, useEffect } from 'react';
import ListChat from './ListChat';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import AuthContext from '../../components/Context/auth.context';
import { getChatHistory, getAllChat, sendMessage } from '../../services/messengerService';

function Messenger() {
    const { auth } = useContext(AuthContext);
    const userId = auth?.user?.id;
    const isAdmin = auth?.user?.groupWithRoles.group.name === 'Quản Lý Thư Viện';
    console.log('userId', userId);
    console.log('isAdmin', isAdmin);

    const [message, setMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageByChat, setMessageByChat] = useState([]);
    const [chatList, setChatList] = useState([]);
    const [localTime, setLocalTime] = useState(new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

    const getAvatar = (user) => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return '?';
    };

    // Hàm chuyển đổi thời gian để hiển thị đúng như trong database
    const formatTimeToVN = (utcTime) => {
        try {
            if (!utcTime) return '--:--';
            const date = new Date(utcTime);
            if (isNaN(date.getTime())) return '--:--';

            // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Ho_Chi_Minh',
            });
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
            const sortedMessages = response.DT.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessageByChat(sortedMessages);

            // Transform messages into chat list format
            const transformedChats = new Map(); // Sử dụng Map để theo dõi tin nhắn mới nhất

            response.DT.forEach((chat) => {
                const otherUser = isAdmin
                    ? chat.sender_id === userId
                        ? chat.receiver
                        : chat.sender
                    : chat.sender_id === userId
                    ? chat.receiver
                    : chat.sender;

                const existingChat = transformedChats.get(otherUser.id);
                const currentMessageTime = new Date(chat.createdAt).getTime();

                // Cập nhật chat nếu tin nhắn này mới hơn
                if (
                    !existingChat ||
                    (existingChat && currentMessageTime > new Date(existingChat.createdAt).getTime())
                ) {
                    transformedChats.set(otherUser.id, {
                        id: chat.message_id,
                        userId: otherUser.id,
                        name: otherUser.username,
                        lastMessage: chat.content,
                        lastTime: formatTimeToVN(chat.createdAt),
                        avatar: getAvatar(otherUser),
                        unread: chat.status === 'Sent' ? 1 : 0,
                        createdAt: chat.createdAt,
                    });
                }
            });

            // Convert Map to array and sort by latest message
            const sortedChats = Array.from(transformedChats.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );

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
            return newState.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedChat) {
            try {
                const createdAtVN = new Date()
                    .toLocaleString('en-CA', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour12: false,
                    })
                    .replace(',', '');

                console.log('createdAtVN', createdAtVN);
                // Gọi API để gửi tin nhắn
                const response = await sendMessage({
                    sender_id: userId,
                    receiver_id: selectedChat.userId,
                    created_at: createdAtVN,
                    content: message.trim(),
                });

                if (response && response.EC === '0') {
                    const newMessage = {
                        message_id: response.DT.id || Date.now(),
                        sender_id: userId,
                        receiver_id: selectedChat.userId,
                        content: message,
                        createdAt: response.DT.created_at,
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
                    setMessageByChat((prevMessages) => {
                        const newMessages = [...prevMessages, newMessage];
                        return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    });

                    // Cập nhật chatList để hiển thị tin nhắn mới nhất
                    setChatList((prevChats) => {
                        const updatedChats = [...prevChats];
                        const chatIndex = updatedChats.findIndex((chat) => chat.userId === selectedChat.userId);
                        if (chatIndex !== -1) {
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: message,
                                lastTime: formatTimeToVN(newMessage.createdAt),
                                createdAt: newMessage.createdAt,
                            };
                        }
                        return updatedChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    });

                    // Clear input message
                    setMessage('');

                    // Refresh messages after sending
                    await fetchAllMessage();
                } else {
                    console.error('Failed to send message:', response?.EM);
                    alert('Không thể gửi tin nhắn. Vui lòng thử lại sau!');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Có lỗi xảy ra khi gửi tin nhắn!');
            }
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
                  timestamp: formatTimeToVN(msg.createdAt),
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
                isAdmin={isAdmin}
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
