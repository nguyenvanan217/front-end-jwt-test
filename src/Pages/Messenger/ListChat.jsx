import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { addMessageCallback, removeMessageCallback } from '../../setup/socket';

function ListChat({ handleChatSelect, selectedChatId, chatList, setChatList, userId, socket, formatTimeToVN }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Xử lý tin nhắn socket với useCallback để tránh tạo lại hàm này mỗi khi render
    const handleSocketMessage = useCallback(
        (newMessage) => {
            console.log('📩 ListChat received socket message:', newMessage);

            const { messageId, sender_id, receiver_id, content, imageUrl, timestamp } = newMessage;
            const senderIdStr = String(sender_id);
            const receiverIdStr = String(receiver_id);
            const userIdStr = String(userId);

            // Chỉ xử lý tin nhắn liên quan đến người dùng hiện tại
            if (senderIdStr === userIdStr || receiverIdStr === userIdStr) {
                const chatUserId = senderIdStr === userIdStr ? receiverIdStr : senderIdStr;

                setChatList((prevChatList) => {
                    const updatedChatList = [...prevChatList];
                    const chatIndex = updatedChatList.findIndex((chat) => String(chat.userId) === chatUserId);
                    const formattedTime = formatTimeToVN(timestamp);

                    if (chatIndex >= 0) {
                        // Cập nhật cuộc trò chuyện hiện có
                        updatedChatList[chatIndex] = {
                            ...updatedChatList[chatIndex],
                            lastMessage: content || '',
                            lastImageUrl: imageUrl || null,
                            lastTime: formattedTime,
                            lastSenderId: senderIdStr,
                            unread:
                                String(selectedChatId) === String(updatedChatList[chatIndex].id)
                                    ? 0
                                    : (updatedChatList[chatIndex].unread || 0) + 1,
                            createdAt: timestamp,
                        };
                    } else {
                        // Thêm cuộc trò chuyện mới nếu chưa tồn tại
                        const userName = chatUserId; // Tạm thời dùng ID làm tên
                        updatedChatList.push({
                            id: messageId,
                            userId: chatUserId,
                            name: userName,
                            lastMessage: content || '',
                            lastImageUrl: imageUrl || null,
                            lastTime: formattedTime,
                            lastSenderId: senderIdStr,
                            avatar: userName.charAt(0).toUpperCase(),
                            unread: String(selectedChatId) === String(messageId) ? 0 : 1,
                            createdAt: timestamp,
                        });
                    }

                    return updatedChatList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                });
            }
        },
        [userId, selectedChatId, setChatList, formatTimeToVN],
    );

    // Đăng ký lắng nghe tin nhắn socket
    useEffect(() => {
        console.log('📩 ListChat setting up socket handler');

        // Đăng ký callback xử lý tin nhắn sử dụng addMessageCallback
        addMessageCallback(handleSocketMessage);

        return () => {
            console.log('📩 ListChat cleaning up socket handler');
            // Cleanup sử dụng removeMessageCallback
            removeMessageCallback(handleSocketMessage);
        };
    }, [handleSocketMessage]);

    const filteredChats = chatList.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getLastMessageDisplay = (chat) => {
        const isSender = String(chat.lastSenderId) === String(userId);
        const hasImage = !!chat.lastImageUrl;
        const hasContent = chat.lastMessage && chat.lastMessage.trim() !== '';

        if (isSender) {
            return hasImage && !hasContent ? 'Bạn: đã gửi một ảnh' : `Bạn: ${chat.lastMessage}`;
        }
        return hasImage && !hasContent ? `${chat.name}: đã gửi một ảnh` : `${chat.name}: ${chat.lastMessage}`;
    };

    return (
        <div className="w-[200px] md:w-[300px] h-[calc(100vh-64px)] bg-white border-r border-gray-300">
            {/* Search Section */}
            <div className="p-2 sm:p-3 md:p-4 border-b border-gray-300">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="w-full pl-7 sm:pl-8 md:pl-10 pr-2 sm:pr-3 md:pr-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <FaSearch className="absolute left-2.5 sm:left-3 md:left-4 top-2 sm:top-2.5 md:top-3 text-gray-400 text-xs sm:text-sm md:text-base" />
                </div>
            </div>

            {/* Chat List Section */}
            <div className="overflow-y-auto h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] md:h-[calc(100vh-144px)]">
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-100
                            ${selectedChatId === chat.id ? 'bg-gray-100' : ''}`}
                    >
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm md:text-base font-bold">
                                {chat.avatar && chat.avatar.startsWith && chat.avatar.startsWith('http') ? (
                                    <img
                                        src={chat.avatar}
                                        alt={chat.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    chat.avatar
                                )}
                            </div>
                            {/* Unread Badge */}
                            {chat.unread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] md:text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center">
                                    {chat.unread}
                                </span>
                            )}
                        </div>

                        {/* Chat Info Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-1 sm:gap-2">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">
                                    {chat.name}
                                </h3>
                                <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 flex-shrink-0">
                                    {chat.lastTime}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">
                                {getLastMessageDisplay(chat)}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredChats.length === 0 && (
                    <div className="p-2 sm:p-3 md:p-4 text-center text-gray-500 text-xs sm:text-sm md:text-base">
                        {searchTerm ? 'Không tìm thấy cuộc trò chuyện phù hợp' : 'Chưa có cuộc trò chuyện nào'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListChat;
