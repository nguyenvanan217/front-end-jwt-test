import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: 'http://localhost:6969',
});

// Cho phép gửi cookie trong request
instance.defaults.withCredentials = true;

// Biến để kiểm soát việc hiển thị toast
let isShowingUnauthorizedToast = false;
let isShowingForbiddenToast = false;

// Interceptor cho request - Thêm token vào header
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

// Interceptor cho response - Xử lý các loại lỗi
instance.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        const status = error?.response?.status || 500;

        switch (status) {
            case 401: {
                // Xử lý khi token hết hạn hoặc không hợp lệ
                // Chỉ hiển thị toast và redirect khi không ở trang login/register
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
                // Xử lý khi người dùng không có quyền truy cập
                // Chỉ hiển thị toast một lần để tránh spam
                if (!isShowingForbiddenToast) {
                    isShowingForbiddenToast = true;
                    toast.error(`Bạn không có quyền truy cập tài nguyên này!`, {
                        onClose: () => {
                            isShowingForbiddenToast = false;
                        },
                    });
                }
                return Promise.resolve({ data: null, status: 403 });
            }

            case 400: {
                // Xử lý lỗi Bad Request - dữ liệu gửi lên không hợp lệ
                toast.error('Invalid request!');
                return Promise.resolve({ data: null, status: 400 });
            }

            case 404: {
                // Xử lý lỗi Not Found - không tìm thấy resource
                toast.error('Resource not found!');
                return Promise.resolve({ data: null, status: 404 });
            }

            case 409: {
                // Xử lý lỗi Conflict - xung đột dữ liệu
                toast.error('Data conflict!');
                return Promise.resolve({ data: null, status: 409 });
            }

            case 422: {
                // Xử lý lỗi Unprocessable Entity - dữ liệu không thể xử lý
                toast.error('Invalid data!');
                return Promise.resolve({ data: null, status: 422 });
            }

            default: {
                // Xử lý các lỗi khác không xác định
                // Đăng xuất và chuyển về trang login sau 3 giây thông báo
                toast.error('An error occurred. Please try again later!');
                localStorage.removeItem('access_token');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
                return Promise.resolve({ data: null, status: status });
            }
        }
    },
);

export default instance;
