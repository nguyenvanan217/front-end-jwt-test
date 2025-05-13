import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { sendMessageToChatbot } from '../../services/chatbotService';

const ChatBot = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            content: message,
            isSender: true,
            timestamp: new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        };
        setMessages((prev) => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await sendMessageToChatbot(message.trim());
            if (response && response.EC === 0) {
                const botMessage = {
                    id: Date.now() + 1,
                    content: response.DT.message,
                    isSender: false,
                    timestamp: new Date().toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }),
                    relatedBooks: response.DT.relatedBooks || [],
                };
                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            const errorMessage = {
                id: Date.now() + 1,
                content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
                isSender: false,
                timestamp: new Date().toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-40 right-4 w-[350px] bg-white rounded-lg shadow-xl border border-gray-200 z-[55]">
            <div className="bg-yellow-500 rounded-t-md text-white flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                    <FaRobot className="w-8 h-8" />
                    <h3 className="font-semibold">Chat với Bot</h3>
                </div>
                <button onClick={onClose} className="text-white hover:text-gray-200">
                    <IoClose size={24} />
                </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'} mb-4`}>
                        {!msg.isSender && (
                            <div className="w-8 h-8 flex items-center justify-center mr-2 bg-yellow-500 rounded-full">
                                <FaRobot className="text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                                msg.isSender ? 'bg-yellow-500 text-white' : 'bg-white text-gray-800 shadow-sm'
                            }`}
                        >
                            <p className="text-sm mb-2">{msg.content}</p>
                            {msg.relatedBooks?.length > 0 && (
                                <div className="mt-2 text-xs">
                                    <p className="font-semibold">Sách liên quan:</p>
                                    {msg.relatedBooks.map((book, index) => (
                                        <p key={index} className="ml-2">
                                            - {book}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <span className="text-xs mt-1 block opacity-75">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="w-8 h-8 flex items-center justify-center mr-2 bg-yellow-500 rounded-full">
                            <FaRobot className="text-white" />
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || loading}
                        className={`p-2 rounded-full ${
                            message.trim() && !loading ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400'
                        } transition-colors`}
                    >
                        <IoSend size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBot;
