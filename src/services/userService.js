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
const fetchStatus = async (id) => {
    const URL_API = `/api/v1/status/read/${id}`;
    return axios.get(URL_API);
};
const updateCurrentUser = async (data) => {
    const URL_API = '/api/v1/users/update';
    return axios.put(URL_API, data);
};
const getUserDetailsById = async (id) => {
    const URL_API = `/api/v1/users/read/${id}`;
    return axios.get(URL_API);
};
const updateTransactionStatus = async (transactionStatuses) => {
    const URL_API = '/api/v1/transactions/update-status';
    return axios.put(URL_API, transactionStatuses);
};
const deleteTransaction = async (transactionId) => {
    const URL_API = `/api/v1/transactions/delete/${transactionId}`;
    return axios.delete(URL_API);
}
export {
    registerNewUser,
    loginUser,
    getAllUsers,
    deleteUser,
    fetchGroup,
    updateCurrentUser,
    fetchStatus,
    getUserDetailsById,
    updateTransactionStatus,
    deleteTransaction,
};
