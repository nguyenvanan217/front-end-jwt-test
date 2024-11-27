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
const getAllUsers = async () => {
    const URL_API = '/api/v1/users/read';
    return axios.get(URL_API);
};
const deleteUser = async (user) => {
    const URL_API = '/api/v1/users/delete';
    const data = { data: { id: user.id } };
    return axios.delete(URL_API, data);
};
const fetchGroup = async () => {
    const URL_API = '/api/v1/groups/read';
    return axios.get(URL_API);
};
export { registerNewUser, loginUser, getAllUsers, deleteUser, fetchGroup };
