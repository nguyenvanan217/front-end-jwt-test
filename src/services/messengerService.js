import axios from '../setup/axios';

const getChatHistory = async (userId) => {
    const URL_API = `/api/v1/getChatHistory/${userId}`;
    return axios.get(URL_API);  
};
//gửi tin nhắn
const sendMessage = (data) => {
    const url = `/api/v1/sendMessage`;
    const formData = new FormData();

    formData.append('sender_id', data.sender_id);
    formData.append('receiver_id', data.receiver_id);
    formData.append('content', data.content || '');
    formData.append('created_at', data.created_at);

    if (data.imageFiles && data.imageFiles.length > 0) {
        data.imageFiles.forEach((file) => {
            formData.append('images', file, file.name);
        });
    }

    // Kiểm tra nội dung FormData
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    return axios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

 // get all chat của admin
 const getAllChatAdmin = async () => {
    const url = '/api/v1/getAllChat';
    return await axios.get(url);
 };
export { getChatHistory, sendMessage, getAllChatAdmin };
