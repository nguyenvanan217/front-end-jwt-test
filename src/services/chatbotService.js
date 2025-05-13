import axios from '../setup/axios';

export const sendMessageToChatbot = async (message) => {
    try {
        const response = await axios.post('/api/v1/chatbot', { message });
        return response;
    } catch (error) {
        console.error('Chatbot error:', error);
        throw error;
    }
};
