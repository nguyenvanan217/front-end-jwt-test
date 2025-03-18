import axios from '../setup/axios';

const getChatHistory = async (userId) => {
    const URL_API = `/api/v1/getChatHistory/${userId}`;
    return axios.get(URL_API);  
};

 // Gửi tin nhắn mới
 const sendMessage = async (data) => {
    const url = '/api/v1/sendMessage';
    console.log("?>>>>>>>>>>>>>>>>data", data);
    return await axios.post(url, data);
 };

 // get all chat của admin
 const getAllChat = async () => {
    const url = '/api/v1/getAllChat';
    return await axios.get(url);
 };
export { getChatHistory, sendMessage, getAllChat };
