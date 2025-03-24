import React, { useState, useContext, useEffect, useRef } from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { MdOutlineSupportAgent } from 'react-icons/md';
import IconChat from './IconChat';
import AuthContext from '../Context/auth.context';
import { getChatHistory, sendMessage } from '../../services/messengerService';
import logo from '../../assets/img/logo university.png';
import { getAdminChatId } from '../../services/userService';

const MessengerWithAdmin = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [adminId, setAdminId] = useState([]);
    const { auth } = useContext(AuthContext);
    const userId = auth?.user?.id;
    const messagesEndRef = useRef(null);

    const getAdminId = async () => {
        try {
            const response = await getAdminChatId();
            console.log('check response in getAdminId:', response);
            if (response && response.EC === 0) { 
                console.log('Setting adminId with:', response.DT);
                setAdminId(response.DT);
            }
        } catch (error) {
            console.log('check error', error);
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
        console.log('adminId updated:', adminId);
    }, [adminId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await getChatHistory(userId);
            console.log('check response', response);
            if (response.EC === '0') {
                const formattedMessages = response.DT.map((msg) => ({
                    id: msg.message_id,
                    content: msg.content,
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            console.log('check mess', messages);
            console.log('check adminId before sending:', adminId);
            
            // Kiểm tra xem có admin không thay vì kiểm tra messages
            if (adminId.length === 0) {
                alert('Không tìm thấy admin để gửi tin nhắn');
                return;
            }

            const createdAtVN = new Date()
                .toLocaleString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour12: false,
                })
                .replace(',', '');

            const sendPromises = adminId.map((admin) => {
                console.log('Sending to admin:', admin);
                return sendMessage({
                    sender_id: userId,
                    receiver_id: admin.id,
                    created_at: createdAtVN,
                    content: message.trim(),
                });
            });
            console.log('sendPromises:', sendPromises);
            const responses = await Promise.all(sendPromises);

            console.log('check responses', responses);
            if (responses.some((response) => response.EC === '0')) {
                const newMessage = {
                    id: responses[0].DT.id, // Sử dụng ID của tin nhắn đầu tiên
                    content: message,
                    timestamp: new Date().toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Ho_Chi_Minh',
                    }),
                    isSender: true,
                };
                setMessages((prev) => [...prev, newMessage]);
                setMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn');
        }
    };

    return (
        <>
            <IconChat onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))} />

            {isOpen && (
                <div className="fixed bottom-24 right-4 w-[350px] bg-white rounded-lg shadow-xl border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 rounded-t-md text-white flex justify-between items-center p-4 border-b">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="w-8 h-8" />
                            <h3 className="font-semibold">Bạn Cần Hỗ Trợ ?</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-700">
                            <IoClose size={24} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isSender ? 'justify-end' : 'justify-start'} mb-4`}>
                                {!msg.isSender && (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                        <MdOutlineSupportAgent className="text-white text-lg" size={24} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        msg.isSender ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <span className="text-xs mt-1 block opacity-75">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="border-t p-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="flex items-center justify-center bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                            >
                                <IoSend />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default MessengerWithAdmin;
