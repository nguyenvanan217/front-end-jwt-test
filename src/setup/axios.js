import axios from 'axios';
import { toast } from 'react-toastify';
// import { toast } from 'react-toastify';
// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: 'http://localhost:6969',
});
instance.defaults.withCredentials = true;
// // Alter defaults after instance has been created

// Biến để theo dõi xem đã hiển thị toast chưa
let isShowingUnauthorizedToast = false;

instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
// Add a request interceptor
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  }, function (error) {
    const status = (error && error.response && error.response.status) || 500;
    switch (status) {
        // xác thực (token related issues)
        case 401: {
            if (
                window.location.pathname !== '/' &&
                window.location.pathname !== '/register' &&
                !isShowingUnauthorizedToast
            ) {
                isShowingUnauthorizedToast = true;
                toast.error('Unauthorized users. Please log in ...', {
                    onClose: () => {
                        isShowingUnauthorizedToast = false;
                    }
                });
            }
            return error.response.data;
        }

        // bị cấm (vấn đề liên quan đến quyền)
        case 403: {
            toast.error(`You don't have permisssion access this resource...`);
            return Promise.reject(error);
        }

        // bad request
        case 400: {
            return Promise.reject(error);
        }

        // k tìm thấy
        case 404: {
            return Promise.reject(error);
        }

        // xung đột
        case 409: {
            return Promise.reject(error);
        }

        // không thể xử lý được
        case 422: {
            return Promise.reject(error);
        }

        // lỗi api chung (liên quan đến máy chủ) không mong muốn
        default: {
            return Promise.reject(error);
        }
    }

  });
export default instance;
