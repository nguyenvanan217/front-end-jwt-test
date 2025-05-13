import React, { useState, useContext, useEffect, useRef } from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { FaImage } from 'react-icons/fa';
import IconChat from './IconChat';
import AuthContext from '../Context/auth.context';
import { getChatHistory, sendMessage } from '../../services/messengerService';
import logo from '../../assets/img/logo university.png';
import { getAdminChatId } from '../../services/userService';
import ModalViewPreviewImage from './ModalViewPreviewImage';
import { toast } from 'react-toastify';
import { connectSocket, addMessageCallback, removeMessageCallback } from '../../setup/socket';
import { ChatContext } from '../Context/chat.context';

const MessengerWithAdmin = () => {
    const { chatState, toggleMessenger } = useContext(ChatContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [adminId, setAdminId] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const { auth } = useContext(AuthContext);
    const userId = String(auth?.user?.id);
    const messagesEndRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const isOpen = chatState.isMessengerOpen; // Thêm dòng này

    const [previewImages, setPreviewImages] = useState([]);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const [selectedImage, setSelectedImage] = useState({
        url: null,
        index: null,
        images: [],
    });

    const getAdminId = async () => {
        try {
            const response = await getAdminChatId();
            if (response && response.EC === 0) {
                setAdminId(response.DT);
            }
        } catch (error) {
            console.error('Error getting admin IDs:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Kết nối socket và lấy dữ liệu ngay khi component được mount, không phụ thuộc vào isOpen
    useEffect(() => {
        if (userId) {
            console.log('Connecting socket from MessengerWithAdmin for user ID:', userId);
            connectSocket(userId);
            getAdminId();

            // Chỉ cần fetch messages khi mở chat lần đầu
            if (isOpen && messages.length === 0) {
                fetchMessages();
            }
        }
    }, [userId, isOpen]);

    // Xử lý tin nhắn socket với useCallback để tránh tạo lại hàm này mỗi khi render
    const handleSocketMessage = React.useCallback(
        (newMessage) => {
            console.log('MessengerWithAdmin received socket message:', newMessage);
            const { messageId, sender_id, receiver_id, content, imageUrl, timestamp } = newMessage;
            const senderIdStr = String(sender_id);
            const receiverIdStr = String(receiver_id);
            const userIdStr = String(userId);

            // Chỉ xử lý tin nhắn liên quan đến người dùng hiện tại
            if (senderIdStr === userIdStr || receiverIdStr === userIdStr) {
                // Kiểm tra xem tin nhắn này đã được hiển thị chưa
                setMessages((prev) => {
                    // Kiểm tra có trùng lặp không (dựa vào messageId và cả các ID tạm thời bắt đầu bằng messageId)
                    const messageExists = prev.some(
                        (msg) =>
                            String(msg.id) === String(messageId) ||
                            (msg.id && msg.id.startsWith && msg.id.startsWith(String(messageId))),
                    );

                    if (messageExists) {
                        return prev; // Nếu tin nhắn đã tồn tại, không thêm vào nữa
                    }

                    // Nếu không phải là người gửi và chat chưa mở thì tăng unreadCount
                    if (senderIdStr !== userIdStr && !isOpen) {
                        setUnreadCount((count) => count + 1);
                    }

                    // Chỉ thêm tin nhắn nếu người gửi KHÔNG phải là người dùng hiện tại
                    // (tin nhắn từ người dùng hiện tại đã được thêm bởi handleSendMessage)
                    if (senderIdStr !== userIdStr) {
                        const newMsg = {
                            id: messageId,
                            content: content || '',
                            imageUrl: imageUrl ? `${process.env.REACT_APP_BACKEND_URL}${imageUrl}` : null,
                            timestamp: new Date(timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'Asia/Ho_Chi_Minh',
                            }),
                            isSender: false, // Tin nhắn nhận từ socket và không phải từ người dùng hiện tại thì chắc chắn là isSender = false
                        };
                        return [...prev, newMsg];
                    }
                    return prev;
                });
            }
        },
        [userId, isOpen],
    );

    // Đăng ký lắng nghe tin nhắn socket - luôn hoạt động kể cả khi chat chưa mở
    useEffect(() => {
        if (!userId) return;

        console.log('Setting up message listener in MessengerWithAdmin');
        addMessageCallback(handleSocketMessage);

        return () => {
            console.log('Cleaning up message listener in MessengerWithAdmin');
            removeMessageCallback(handleSocketMessage);
        };
    }, [userId, handleSocketMessage]);

    // Reset unreadCount khi mở chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        try {
            const response = await getChatHistory(userId);
            if (response.EC === '0') {
                const formattedMessages = response.DT.map((msg) => ({
                    id: msg.message_id,
                    content: msg.content,
                    imageUrl: msg.image_url ? `${process.env.REACT_APP_BACKEND_URL}${msg.image_url}` : null,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Ho_Chi_Minh',
                    }),
                    isSender: String(msg.sender_id) === String(userId), // Convert both to strings before comparing
                }));

                console.log('Formatted messages:', formattedMessages); // Add logging
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0 || files.length > 5) {
            toast.error('Vui lòng chỉ chọn tối đa 5 ảnh');
            return;
        }
        const newPreviewUrls = [];
        const newFiles = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            newFiles.push(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                newPreviewUrls.push(event.target.result);
                if (newPreviewUrls.length === files.length) {
                    setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
                    setImageFiles((prev) => [...prev, ...newFiles]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() && imageFiles.length === 0) return;

        try {
            setUploading(true);

            const createdAtVN = new Date()
                .toLocaleString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour12: false,
                })
                .replace(',', '');

            const messageData = {
                sender_id: userId,
                receiver_id: adminId.length > 0 ? adminId[0].id : null,
                content: message.trim() || '',
                created_at: createdAtVN,
                imageFiles: imageFiles,
            };

            if (adminId.length > 0) {
                const response = await sendMessage(messageData);
                console.log('Response from sendMessage:', response);
                if (response.EC === '0') {
                    // Nếu có hình ảnh, thêm các ảnh trước
                    if (previewImages.length > 0) {
                        // Nếu có url trả về từ response thì dùng url đó
                        if (response.DT?.imageUrls && response.DT.imageUrls.length > 0) {
                            // Thêm các hình ảnh không kèm nội dung trước
                            for (let i = 0; i < response.DT.imageUrls.length - 1; i++) {
                                const imgMsg = {
                                    id: `${response.DT?.messageId || Date.now().toString()}-img-${i}`,
                                    content: '',
                                    imageUrl: `${process.env.REACT_APP_BACKEND_URL}${response.DT.imageUrls[i]}`,
                                    isSender: true,
                                    timestamp: new Date().toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                    }),
                                };
                                setMessages((prev) => [...prev, imgMsg]);
                            }

                            // Thêm ảnh cuối cùng kèm nội dung tin nhắn
                            const lastIndex = response.DT.imageUrls.length - 1;
                            const lastImgMsg = {
                                id: `${response.DT?.messageId || Date.now().toString()}-img-${lastIndex}`,
                                content: message.trim() || '',
                                imageUrl: `${process.env.REACT_APP_BACKEND_URL}${response.DT.imageUrls[lastIndex]}`,
                                isSender: true,
                                timestamp: new Date().toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                }),
                            };
                            setMessages((prev) => [...prev, lastImgMsg]);
                        } else {
                            // Nếu chưa có url trả về, dùng tạm preview
                            // Thêm các hình ảnh không kèm nội dung trước
                            for (let i = 0; i < previewImages.length - 1; i++) {
                                const imgMsg = {
                                    id: `${response.DT?.messageId || Date.now().toString()}-img-${i}`,
                                    content: '',
                                    imageUrl: previewImages[i],
                                    isSender: true,
                                    timestamp: new Date().toLocaleTimeString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                    }),
                                };
                                setMessages((prev) => [...prev, imgMsg]);
                            }

                            // Thêm ảnh cuối cùng kèm nội dung tin nhắn
                            const lastIndex = previewImages.length - 1;
                            const lastImgMsg = {
                                id: `${response.DT?.messageId || Date.now().toString()}-img-${lastIndex}`,
                                content: message.trim() || '',
                                imageUrl: previewImages[lastIndex],
                                isSender: true,
                                timestamp: new Date().toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                }),
                            };
                            setMessages((prev) => [...prev, lastImgMsg]);
                        }
                    } else {
                        // Nếu không có hình ảnh, thêm tin nhắn text
                        const newMessage = {
                            id: response.DT?.messageId || Date.now().toString(),
                            content: message.trim() || '',
                            isSender: true,
                            timestamp: new Date().toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'Asia/Ho_Chi_Minh',
                            }),
                        };
                        setMessages((prev) => [...prev, newMessage]);
                    }

                    setMessage('');
                    setPreviewImages([]);
                    setImageFiles([]);
                } else {
                    toast.error('Không thể gửi tin nhắn: ' + response.EM);
                }
            } else {
                toast.error('Không tìm thấy admin để gửi tin nhắn');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Có lỗi xảy ra khi gửi tin nhắn');
        } finally {
            setUploading(false);
        }
    };

    const handleImageClick = (imgUrl, index, imageSource = 'preview') => {
        let imageList = [];
        if (imageSource === 'preview') {
            imageList = previewImages;
        } else if (imageSource === 'messages') {
            imageList = messages.filter((msg) => msg.imageUrl).map((msg) => msg.imageUrl);
        }

        if (!imageList || imageList.length === 0) return;

        setSelectedImage({
            url: imgUrl,
            index: imageList.indexOf(imgUrl),
            images: imageList,
        });
    };

    const handleToggleChat = () => {
        toggleMessenger();
    };

    return (
        <>
            <IconChat onClick={toggleMessenger} unreadCount={unreadCount} />
            {isOpen && (
                <div className="fixed bottom-24 right-4 w-[350px] bg-white rounded-lg shadow-xl border border-gray-200 z-[55]">
                    {/* ...existing chat UI code... */}
                    <div className="bg-blue-500 rounded-t-md text-white flex justify-between items-center p-4">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold">Chat với Admin</h3>
                        </div>
                        <button onClick={toggleMessenger} className="text-white hover:text-gray-200">
                            <IoClose size={24} />
                        </button>
                    </div>
                    {/* ...rest of the chat UI... */}
                    <div className="h-96 overflow-y-auto p-4">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'} mb-4`}>
                                {!msg.isSender && (
                                    <div className="w-8 h-8 flex items-center justify-center mr-2">
                                        <img src={logo} alt="Logo" className="w-8 h-8" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        msg.isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {msg.imageUrl && (
                                        <img
                                            src={msg.imageUrl}
                                            alt="Hình ảnh"
                                            className="max-w-full max-h-64 rounded-md mb-2 cursor-pointer"
                                            onClick={() => handleImageClick(msg.imageUrl, index, 'messages')}
                                        />
                                    )}
                                    {msg.content && <p className="text-sm mb-2">{msg.content}</p>}
                                    <span className="text-xs mt-1 block opacity-75">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="border-t p-4">
                        {previewImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto py-4">
                                {previewImages.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={img}
                                            alt={`Preview ${index}`}
                                            className="w-20 h-20 object-cover rounded-md cursor-pointer"
                                            onClick={() => handleImageClick(img, index, 'preview')}
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

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                                <FaImage size={20} />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            />

                            <button
                                type="submit"
                                disabled={uploading || (!message.trim() && previewImages.length === 0)}
                                className={`p-2 rounded-full ${
                                    message.trim() || previewImages.length > 0
                                        ? 'text-blue-500 hover:bg-blue-50'
                                        : 'text-gray-400'
                                } transition-colors`}
                            >
                                {uploading ? '...' : <IoSend size={20} />}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {selectedImage.url && (
                <ModalViewPreviewImage
                    imageUrl={selectedImage.url}
                    onClose={() => setSelectedImage({ url: null, index: null, images: [] })}
                    images={selectedImage.images}
                    currentIndex={selectedImage.index}
                />
            )}
        </>
    );
};

export default MessengerWithAdmin;
