import React, { useState, useContext, useEffect, useRef } from 'react';
import ListChat from './ListChat';
import { IoSend } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import AuthContext from '../../components/Context/auth.context';
import { getAllChatAdmin, sendMessage } from '../../services/messengerService';
import ModalViewPreviewImage from '../../components/MessengerWithAdmin/ModalViewPreviewImage';

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
                imageUrl: message.image_url ? `${process.env.REACT_APP_BACKEND_URL}${message.image_url}` : null,
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
                  imageUrl: msg.image_url ? `${process.env.REACT_APP_BACKEND_URL}${msg.image_url}` : null,
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
            <ListChat
                handleChatSelect={handleChatSelect}
                selectedChatId={selectedChat?.id}
                fetchAllMessage={fetchAllMessage}
                chatList={chatList}
                getAvatar={getAvatar}
                isAdmin={isAdmin}
                userId={userId}
            />

            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
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

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedChatMessages.map((msg, index) => (
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
                                        {msg.imageUrl && (
                                            <img
                                                src={msg.imageUrl}
                                                alt="Message Image"
                                                className="max-w-full max-h-64 rounded-md mb-1 cursor-pointer"
                                                onClick={() => handleImageClick(msg.imageUrl, index, 'messages')}
                                            />
                                        )}
                                        {msg.content && <p>{msg.content}</p>}
                                        <span className="text-xs text-gray-400 mt-1 block">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-300">
                            {previewImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {previewImages.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Preview ${index}`}
                                                className="w-20 h-20 object-cover rounded-md cursor-pointer transition-transform duration-500 ease-in-out"
                                                onClick={() => handleImageClick(image, index, 'preview')}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveImage(index);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 relative">
                                <button
                                    type="button"
                                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                                    onClick={handleOpenImageUpload}
                                >
                                    <FaImage size={20} />
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
                                    className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() && imageFiles.length === 0}
                                    className={`p-2 rounded-full ${
                                        message.trim() || imageFiles.length > 0
                                            ? 'text-blue-500 hover:bg-blue-50'
                                            : 'text-gray-400'
                                    } transition-colors`}
                                >
                                    <IoSend size={20} />
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
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;
