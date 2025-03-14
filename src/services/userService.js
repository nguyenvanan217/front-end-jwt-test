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
const getAllUsers = async (page, limit, searchTerm) => {
    const URL_API = `/api/v1/users/read?page=${page}&limit=${limit}&search=${searchTerm}`;
    return axios.get(URL_API);
};
const deleteUser = async (user) => {
    const URL_API = '/api/v1/users/delete';
    const data = { data: { id: user.id } };
    return axios.delete(URL_API, data);
};
const updateCurrentUser = async (data) => {
    const URL_API = '/api/v1/users/update';
    return axios.put(URL_API, data);
};
const fetchGroup = async () => {
    const URL_API = '/api/v1/groups/read';
    return axios.get(URL_API);
};
const fetchStatus = async (id) => {
    const URL_API = `/api/v1/status/read/${id}`;
    return axios.get(URL_API);
};
const getUserDetailsById = async (id) => {
    const URL_API = `/api/v1/users/get-detail/${id}`;
    return axios.get(URL_API);
};
const deleteTransaction = async (transactionId) => {
    const URL_API = `/api/v1/transactions/delete/${transactionId}`;
    return axios.delete(URL_API);
};
const markViolationAsResolved = async (transactionId) => {
    console.log('hilu', transactionId);
    const URL_API = `/api/v1/transactions/resolve-violation/${transactionId}`;
    return axios.put(URL_API);
};
const updateTransactionDateAndStatus = async (transactions) => {
    const URL_API = '/api/v1/transactions/update-date-and-status';
    return axios.put(URL_API, transactions);
};
const getAllInforUser = async (currentPage, currentLimit, searchTerm) => {
    console.log('currentPage1', currentPage);
    console.log('currentLimit1', currentLimit);
    console.log('searchTerm1', searchTerm);
    const URL_API = `/api/v1/users/get-all-user-infor?page=${currentPage}&limit=${currentLimit}&search=${searchTerm}`;
    return axios.get(URL_API);
};
const logoutUser = async () => {
    const URL_API = '/api/v1/logout';
    return axios.post(URL_API);
};
const getAccount = async () => {
    const URL_API = '/api/v1/account';
    return axios.get(URL_API);
};
export {
    registerNewUser,
    loginUser,
    getAllUsers,
    deleteUser,
    fetchGroup,
    updateCurrentUser,
    fetchStatus,
    getUserDetailsById,
    deleteTransaction,
    markViolationAsResolved,
    updateTransactionDateAndStatus,
    getAllInforUser,
    logoutUser,
    getAccount,
};
