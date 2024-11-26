import axios from '../setup/axios';

const registerNewUser = async (email, username, password) => {
    const URL_API = '/api/v1/register';
    const data = {
        email,
        username,
        password,
    };
    return axios.post(URL_API, data);
};
const loginUser = async (email, password) => {
    const URL_API = '/api/v1/login';
    const data = {
        email,
        password,
    };
    return axios.post(URL_API, data);
};
export { registerNewUser, loginUser };
