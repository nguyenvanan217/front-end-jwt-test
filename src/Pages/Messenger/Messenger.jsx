import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import ListChat from './ListChat';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import AuthContext from '../../components/Context/auth.context';
import { getAllChatAdmin, sendMessage } from '../../services/messengerService';
import ModalViewPreviewImage from '../../components/MessengerWithAdmin/ModalViewPreviewImage';
import { connectSocket, addMessageCallback, removeMessageCallback } from '../../setup/socket';
import socket from '../../setup/socket';

const Messenger = () => {
    const { auth } = useContext(AuthContext);
    const userId = auth?.user?.id;
    const isAdmin = auth?.user?.groupWithRoles.group.name.includes('Quản Lý Thư Viện');
    console.log('userId', userId);
    console.log('isAdmin', isAdmin);

    const [message, setMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageByChat, setMessageByChat] = useState([]);
    const [chatList, setChatList] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]); // Thêm state cho file gốc
    const [selectedImage, setSelectedImage] = useState({
        url: null,
        index: null,
        images: [],
    });
    const [selectedChatMessages, setSelectedChatMessages] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageByChat]);

    const getAvatar = (user) => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return '?';
    };

    const formatTimeToVN = (utcTime) => {
        try {
            if (!utcTime) return '--:--';
            const date = new Date(utcTime);
            if (isNaN(date.getTime())) return '--:--';
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
            const response = (await getAllChatAdmin()) || null;
            if (!response?.DT) return;

            const adminMessages = response.DT.filter(
                (chat) => chat.sender_id === userId || chat.receiver_id === userId,
            );

            const sortedMessages = adminMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessageByChat(sortedMessages);

            const transformedChats = new Map();

            adminMessages.forEach((chat) => {
                if (chat.sender_id !== userId && chat.receiver_id !== userId) return;

                const otherUser = chat.sender_id === userId ? chat.receiver : chat.sender;
                if (!otherUser?.id) return;

                const existingChat = transformedChats.get(otherUser.id);
                const currentTime = new Date(chat.createdAt).getTime();

                if (!existingChat || currentTime > new Date(existingChat.createdAt).getTime()) {
                    transformedChats.set(otherUser.id, {
                        id: chat.message_id,
                        userId: otherUser.id,
                        name: otherUser.username, // Tên của người kia
                        lastMessage: chat.content,
                        lastSenderId: chat.sender_id, // ID người gửi tin nhắn cuối
                        lastImageUrl: chat.image_url, // URL ảnh của tin nhắn cuối (nếu có)
                        lastTime: formatTimeToVN(chat.createdAt),
                        avatar: getAvatar(otherUser),
                        unread: chat.status === 'Sent' ? 1 : 0,
                        createdAt: chat.createdAt,
                    });
                }
            });

            const sortedChats = Array.from(transformedChats.values()).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            setChatList(sortedChats);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        fetchAllMessage();
    }, []);

    // Connect socket khi component mount và chỉ chạy một lần duy nhất
    useEffect(() => {
        if (!userId) return;

        console.log('Connecting socket for user ID:', userId);
        connectSocket(userId);

        return () => {
            // No cleanup needed for connectSocket
        };
    }, [userId]);

    // Xử lý tin nhắn socket riêng biệt với useCallback
    const handleSocketMessage = useCallback(
        (newMessage) => {
            console.log('Received real-time message in Messenger:', newMessage);
            const { messageId, sender_id, receiver_id, content, imageUrl, timestamp } = newMessage;
            const senderIdStr = String(sender_id);
            const receiverIdStr = String(receiver_id);
            const userIdStr = String(userId);

            // Only process messages where this user is sender or receiver
            if (senderIdStr === userIdStr || receiverIdStr === userIdStr) {
                // Find sender info from the chat list if available
                let senderName = 'User';
                const otherUserId = senderIdStr === userIdStr ? receiverIdStr : senderIdStr;

                // Tìm thông tin người gửi từ danh sách chat
                const relevantChat = chatList.find((chat) => String(chat.userId) === otherUserId);

                if (relevantChat) {
                    senderName = relevantChat.name;
                }

                // Format tin nhắn để phù hợp với cấu trúc API
                const newMsg = {
                    message_id: messageId,
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    content: content || '',
                    image_url: imageUrl
                        ? imageUrl.startsWith('http')
                            ? imageUrl
                            : `${process.env.REACT_APP_BACKEND_URL}${imageUrl}`
                        : null,
                    createdAt: timestamp,
                    sender: {
                        id: sender_id,
                        username: senderIdStr === userIdStr ? 'You' : senderName,
                    },
                    receiver: {
                        id: receiver_id,
                        username: receiverIdStr === userIdStr ? 'You' : senderName,
                    },
                    status: 'Sent',
                };

                console.log('Adding new message to state:', newMsg);

                // Cập nhật state messageByChat
                setMessageByChat((prevMessages) => {
                    // Kiểm tra xem tin nhắn đã tồn tại chưa
                    const exists = prevMessages.some((msg) => String(msg.message_id) === String(messageId));
                    if (exists) return prevMessages;
                    return [...prevMessages, newMsg];
                });
            }
        },
        [userId, chatList],
    );

    // Đăng ký lắng nghe tin nhắn socket
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up message listener in Messenger');
        addMessageCallback(handleSocketMessage);

        return () => {
            console.log('Cleaning up message listener in Messenger');
            removeMessageCallback(handleSocketMessage);
        };
    }, [userId, handleSocketMessage]);

    const handleChatSelect = (chat) => {
        console.log('Selected chat:', chat);
        setSelectedChat(chat);

        if (!messageByChat || messageByChat.length === 0) {
            console.warn('No messages available.');
            return;
        }

        const selectedUserMessages = messageByChat
            .filter((message) => {
                const isCurrentConversation =
                    (message.sender_id === userId && message.receiver_id === chat.userId) ||
                    (message.sender_id === chat.userId && message.receiver_id === userId) ||
                    (message.sender_id === userId && message.receiver_id === userId);
                return isCurrentConversation;
            })
            .map((message) => ({
                id: message.message_id,
                sender: message.sender_id === userId ? 'You' : chat.name,
                content: message.content,
                imageUrl: message.image_url
                    ? message.image_url.startsWith('http')
                        ? message.image_url
                        : `${process.env.REACT_APP_BACKEND_URL}${message.image_url}`
                    : null,
                timestamp: formatTimeToVN(message.createdAt),
                isSender: message.sender_id === userId,
                avatar:
                    message.sender_id === userId ? getAvatar({ username: 'You' }) : getAvatar({ username: chat.name }),
                createdAt: message.createdAt,
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setMessageByChat((prevState) => {
            const newState = [...prevState];
            selectedUserMessages.forEach((msg) => {
                if (!newState.find((m) => m.id === msg.id)) {
                    newState.push(msg);
                }
            });
            return newState.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!message.trim() && imageFiles.length === 0) || !selectedChat) return;

        try {
            const createdAtVN = new Date()
                .toLocaleString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour12: false,
                })
                .replace(',', '');

            const messageData = {
                sender_id: userId,
                receiver_id: selectedChat.userId,
                created_at: createdAtVN,
                content: message.trim() || '',
                imageFiles: imageFiles,
            };

            const response = await sendMessage(messageData);

            if (response && response.EC === '0') {
                setMessage('');
                setPreviewImages([]);
                setImageFiles([]);
                await fetchAllMessage();
            } else {
                console.error('Failed to send message:', response?.EM);
                alert('Không thể gửi tin nhắn: ' + response?.EM);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn!');
        }
    };

    const handleOpenImageUpload = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        const newPreviewUrls = [];
        const newFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            newFiles.push(file);
            newPreviewUrls.push(URL.createObjectURL(file));
        }

        setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
        setImageFiles((prev) => [...prev, ...newFiles]);
    };

    const handleRemoveImage = (index) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImageClick = (imageUrl, index, imageSource = 'preview') => {
        let imageList = [];
        if (imageSource === 'preview') {
            imageList = previewImages;
        } else if (imageSource === 'messages') {
            imageList = selectedChatMessages.filter((msg) => msg.imageUrl).map((msg) => msg.imageUrl);
        }

        if (!imageList || imageList.length === 0) return;

        setSelectedImage({
            url: imageUrl,
            index: imageList.indexOf(imageUrl),
            images: imageList,
        });
    };

    // Theo dõi messageByChat để cập nhật lại selectedChatMessages một cách tự động
    useEffect(() => {
        if (!selectedChat) {
            setSelectedChatMessages([]);
            return;
        }

        const messages = messageByChat
            .filter((msg) => {
                // Chỉ hiển thị tin nhắn thuộc cuộc trò chuyện hiện tại
                const isCurrentConversation =
                    (String(msg.sender_id) === String(userId) &&
                        String(msg.receiver_id) === String(selectedChat.userId)) ||
                    (String(msg.sender_id) === String(selectedChat.userId) &&
                        String(msg.receiver_id) === String(userId));
                return isCurrentConversation;
            })
            .map((msg) => ({
                id: msg.message_id,
                content: msg.content,
                imageUrl: msg.image_url
                    ? msg.image_url.startsWith('http')
                        ? msg.image_url
                        : `${process.env.REACT_APP_BACKEND_URL}${msg.image_url}`
                    : null,
                timestamp: formatTimeToVN(msg.createdAt),
                isSender: String(msg.sender_id) === String(userId),
                avatar:
                    String(msg.sender_id) === String(userId)
                        ? getAvatar({ username: 'You' })
                        : getAvatar({ username: selectedChat.name }),
            }))
            .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

        setSelectedChatMessages(messages);
        // Cuộn xuống phía dưới khi có tin nhắn mới
        setTimeout(scrollToBottom, 100);
    }, [messageByChat, selectedChat, userId]);

    // Theo dõi messageByChat để tự động cập nhật selectedChatMessages khi có tin nhắn mới
    useEffect(() => {
        // Khi có tin nhắn mới được nhận, cần tạo thông báo nếu chưa chọn chat hoặc tin nhắn từ người khác
        if (messageByChat.length > 0 && !selectedChat) {
            // Đây là thời điểm tốt để hiển thị thông báo có tin nhắn mới
            console.log('Có tin nhắn mới khi chưa có cuộc trò chuyện nào được chọn');
        } else if (messageByChat.length > 0 && selectedChat) {
            // Kiểm tra xem tin nhắn mới có thuộc về cuộc trò chuyện hiện tại không
            const latestMessage = messageByChat[messageByChat.length - 1];
            const isForeignMessage =
                String(latestMessage.sender_id) !== String(userId) &&
                (String(latestMessage.sender_id) === String(selectedChat.userId) ||
                    String(latestMessage.receiver_id) === String(selectedChat.userId));

            if (isForeignMessage) {
                console.log('Tin nhắn mới từ đối tác trong cuộc trò chuyện hiện tại', latestMessage);
                // Đảm bảo cuộn xuống cuối cùng
                setTimeout(scrollToBottom, 100);
            }
        }
    }, [messageByChat, selectedChat, userId]);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100">
            <ListChat
                handleChatSelect={handleChatSelect}
                selectedChatId={selectedChat?.id}
                chatList={chatList}
                setChatList={setChatList}
                userId={userId}
                socket={socket}
                formatTimeToVN={formatTimeToVN}
            />

            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="bg-white p-2 sm:p-4 border-b border-gray-300 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-300 text-white text-sm sm:text-base font-bold">
                                {selectedChat.avatar.startsWith('http') ? (
                                    <img
                                        src={selectedChat.avatar}
                                        alt={selectedChat.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    selectedChat.avatar
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm sm:text-base">{selectedChat.name}</h2>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
                            {selectedChatMessages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-1 sm:gap-2 ${
                                        msg.isSender ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gray-300 text-white text-xs sm:text-sm font-bold">
                                        {msg.avatar}
                                    </div>
                                    <div
                                        className={`max-w-[75%] sm:max-w-[70%] ${
                                            msg.isSender
                                                ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg'
                                                : 'bg-white rounded-r-lg rounded-bl-lg'
                                        } p-2 sm:p-3 shadow-sm`}
                                    >
                                        {msg.imageUrl && (
                                            <img
                                                src={msg.imageUrl}
                                                alt="Message Image"
                                                className="max-w-full max-h-48 sm:max-h-64 rounded-md mb-1 cursor-pointer"
                                                onClick={() => handleImageClick(msg.imageUrl, index, 'messages')}
                                            />
                                        )}
                                        {msg.content && <p className="text-sm sm:text-base">{msg.content}</p>}
                                        <span className="text-[10px] sm:text-xs text-gray-400 mt-1 block">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Form */}
                        <form onSubmit={handleSendMessage} className="bg-white p-2 sm:p-4 border-t border-gray-300">
                            {previewImages.length > 0 && (
                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Preview ${index}`}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md cursor-pointer transition-transform duration-500 ease-in-out"
                                                onClick={() => handleImageClick(image, index, 'preview')}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage(index);
                                                }}
                                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-1 sm:gap-2 relative">
                                <button
                                    type="button"
                                    className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-500 transition-colors"
                                    onClick={handleOpenImageUpload}
                                >
                                    <FaImage className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 p-1.5 sm:p-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() && imageFiles.length === 0}
                                    className={`p-1.5 sm:p-2 rounded-full ${
                                        message.trim() || imageFiles.length > 0
                                            ? 'text-blue-500 hover:bg-blue-50'
                                            : 'text-gray-400'
                                    } transition-colors`}
                                >
                                    <IoSend className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </form>

                        {selectedImage.url && (
                            <ModalViewPreviewImage
                                imageUrl={selectedImage.url}
                                onClose={() => setSelectedImage({ url: null, index: null, images: [] })}
                                images={selectedImage.images}
                                currentIndex={selectedImage.index}
                            />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 ml-5 text-sm sm:text-base">
                        Chọn một cuộc trò chuyện để bắt đầu!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
