import axios from '../setup/axios';

const registerNewUser = async (email, username, password) => {
    return axios.post('/api/v1/register', {
        email,
        username,
        password,
    });
};
const loginUser = async (email, password) => {
    return axios.post('/api/v1/login', {
        email,
        password,
    });
};
export { registerNewUser, loginUser };
