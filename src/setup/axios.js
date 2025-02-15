import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: 'http://localhost:6969',
});

instance.defaults.withCredentials = true;

let isShowingUnauthorizedToast = false;
let isShowingForbiddenToast = false;

instance.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

instance.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        const status = error?.response?.status || 500;

        switch (status) {
            case 401: {
                if (
                    window.location.pathname !== '/' &&
                    window.location.pathname !== '/register' &&
                    !isShowingUnauthorizedToast
                ) {
                    isShowingUnauthorizedToast = true;
                    localStorage.removeItem('access_token');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                    toast.error('Session expired. Please log in again!', {
                        onClose: () => {
                            isShowingUnauthorizedToast = false;
                        },
                    });
                }
                return Promise.resolve({ data: null, status: 401 });
            }

            case 403: {
                if (!isShowingForbiddenToast) {
                    isShowingForbiddenToast = true;
                    toast.error(`You don't have permission to access this resource!`, {
                        onClose: () => {
                            isShowingForbiddenToast = false;
                        },
                    });
                }
                // Trả về một Promise đã được resolve để ngăn lỗi xuất hiện trong console
                return Promise.resolve({ data: null, status: 403 });
            }

            case 400: {
                toast.error('Invalid request!');
                return Promise.resolve({ data: null, status: 400 });
            }

            case 404: {
                toast.error('Resource not found!');
                return Promise.resolve({ data: null, status: 404 });
            }

            case 409: {
                toast.error('Data conflict!');
                return Promise.resolve({ data: null, status: 409 });
            }

            case 422: {
                toast.error('Invalid data!');
                return Promise.resolve({ data: null, status: 422 });
            }

            default: {
                toast.error('An error occurred. Please try again later!');
                return Promise.resolve({ data: null, status: status });
            }
        }
    },
);

export default instance;
