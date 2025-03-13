import axios from '../setup/axios';

const fetchRole = async () => {
    const URL_API = '/api/v1/roles/read';
    return axios.get(URL_API);
};  
const fetchGroupWithRole = async (id) => {
    const URL_API = `/api/v1/roles/read-group-with-role/${id}`;
    return axios.get(URL_API);
};
export { fetchRole, fetchGroupWithRole };
