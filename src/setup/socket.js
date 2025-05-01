import { io } from 'socket.io-client';

const getSocketURL = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:6969';
    console.log('Socket URL:', apiUrl);
    return apiUrl;
};

const socket = io(getSocketURL(), {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
});

let isConnected = false;
let messageCallback = null;
let currentUserId = null;
let messageCallbacks = new Set();

socket.on('disconnect', () => {
    console.log('Socket disconnected');
    isConnected = false;
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

socket.onAny((event, ...args) => {
    console.log(`Received event: ${event}`, args);
});

socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    isConnected = true;
    if (currentUserId) {
        console.log('Joining room on connect/reconnect for userId:', currentUserId);
        socket.emit('join', currentUserId);
    }
});

export const setMessageCallback = (callback) => {
    messageCallback = callback;
    return () => {
        // Cleanup function that removes the callback
        messageCallback = null;
    };
};

export const addMessageCallback = (callback) => {
    messageCallbacks.add(callback);
};

export const removeMessageCallback = (callback) => {
    messageCallbacks.delete(callback);
};

socket.on('message', (newMessage) => {
    console.log('🔵 [Socket Global] Received message:', {
        messageId: newMessage.messageId,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
    });
    messageCallbacks.forEach((callback) => callback(newMessage));
});

export const connectSocket = (userId) => {
    currentUserId = String(userId);
    if (!isConnected) {
        console.log('Socket connecting...');
        socket.connect();
    } else {
        console.log('Already connected, joining room for userId:', userId);
        socket.emit('join', String(userId));
    }
};

export default socket;
