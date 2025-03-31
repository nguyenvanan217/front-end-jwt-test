import React, { useState, useContext, useEffect, useRef } from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { FaImage } from 'react-icons/fa';
import IconChat from './IconChat';
import AuthContext from '../Context/auth.context';
import { getChatHistory, sendMessage } from '../../services/messengerService';
import logo from '../../assets/img/logo university.png';
import { getAdminChatId } from '../../services/userService';
import ModalViewPreviewImage from './ModalViewPreviewImage';

const MessengerWithAdmin = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [adminId, setAdminId] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const { auth } = useContext(AuthContext);
    const userId = auth?.user?.id;
    const messagesEndRef = useRef(null);

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

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            getAdminId();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await getChatHistory(userId);
            console.log('Response from getChatHistory:', response);
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
                    isSender: msg.sender_id === userId,
                }));
                setMessages(formattedMessages);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

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
                    setMessage('');
                    setPreviewImages([]);
                    setImageFiles([]);
                    await fetchMessages();
                } else {
                    alert('Không thể gửi tin nhắn: ' + response.EM);
                }
            } else {
                alert('Không tìm thấy admin để gửi tin nhắn');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn');
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

    return (
        <>
            <IconChat onClick={() => setIsOpen(!isOpen)} />

            {isOpen && (
                <div className="fixed bottom-24 right-4 w-[350px] bg-white rounded-lg shadow-xl border border-gray-200">
                    <div className="bg-blue-600 rounded-t-md text-white flex justify-between items-center p-4 border-b">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="w-8 h-8" />
                            <h3 className="font-semibold">Bạn Cần Hỗ Trợ ?</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-700">
                            <IoClose size={24} />
                        </button>
                    </div>

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