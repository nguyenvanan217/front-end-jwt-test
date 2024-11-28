import axios from '../setup/axios';
const getAllBook = async () => {
    const URL_API = '/api/v1/books/read';
    return axios.get(URL_API);
};
export { getAllBook };
