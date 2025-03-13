import axios from '../setup/axios';

const fetchRole = async () => {
    const URL_API = '/api/v1/roles/read';
    return axios.get(URL_API);
};  
const fetchGroupWithRole = async (id) => {
    const URL_API = `/api/v1/roles/read-group-with-role/${id}`;
    return axios.get(URL_API);
};
const updateRole = async (groupId, selectedPermissions) => { 
    console.log("groupId:", groupId); 
    console.log("selectedPermissions:", selectedPermissions);

    const URL_API = `/api/v1/roles/update-role-for-group/${groupId}`;
    return axios.put(URL_API, { roles: selectedPermissions });
};


export { fetchRole, fetchGroupWithRole, updateRole };
