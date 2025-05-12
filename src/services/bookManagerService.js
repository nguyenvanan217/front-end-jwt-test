import axios from '../setup/axios';

const getAllBook = async (page, limit, searchTerm) => {
    try {
        let url = `/api/v1/books/read?page=${page}&limit=${limit}`;
        if (searchTerm) {
            url += `&search=${searchTerm}`;
        }
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error('Error in getAllBook:', error);
        throw error;
    }
};

const getAllGenres = async () => {
    const URL_API = '/api/v1/genres/read';
    return axios.get(URL_API);
};

const addBook = async (bookData) => {
    const URL_API = '/api/v1/books/create';
    const data = {
        author: bookData.author,
        cover_image: bookData.cover_image,
        genre_name: bookData.genre_name,
        quantity: bookData.quantity,
        title: bookData.title,
    };
    return axios.post(URL_API, data);
};

const deleteBook = async (bookId) => {
    const URL_API = `/api/v1/books/delete/${bookId}`;
    return axios.delete(URL_API);
};

const updateBook = async (bookId, bookData) => {
    const URL_API = `/api/v1/books/update/${bookId}`;
    return axios.put(URL_API, bookData);
};

const addGenre = async (genreName) => {
    const URL_API = '/api/v1/genres/create';
    return axios.post(URL_API, { name: genreName });
};

const deleteGenre = async (genreId) => {
    const URL_API = `/api/v1/genres/delete/${genreId}`;
    return axios.delete(URL_API);
};

const createTransaction = async (data) => {
    const URL_API = '/api/v1/transactions/create';
    return axios.post(URL_API, {
        bookId: data.bookId,
        studentEmail: data.studentEmail,
        borrowDate: data.borrowDate,
        returnDate: data.returnDate,
        status: 'Chờ trả',
    });
};

const getBookDetail = async (bookId) => {
    try {
        const URL_API = `/api/v1/books/read/${bookId}`;
        const response = await axios.get(URL_API);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const autoUpdateStatusInDB = async () => {
    try {
        const URL_API = `/api/v1/transactions/autoupdatestatus`;
        const response = await axios.put(URL_API);
        return response.data;
    } catch (error) {
        console.error('Lỗi trong hàm autoUpdateStatusInDB:', error);
        throw error;
    }
};

export const importBooksFromExcel = async (formData) => {
    try {
        const file = formData.get('file');
        if (!file) {
            throw new Error('Không tìm thấy file');
        }

        const response = await axios.post('/api/v1/books/import-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Import response check nì:', response);
        // Kiểm tra response có phải là validation error không
        if (response.DT?.details) {
            return {
                EC: 1, // Đổi EC thành 1 để phân biệt với lỗi server
                EM: 'Dữ liệu Excel đầu vào không hợp lệ, vui lòng kiểm tra lại dữ liệu của bạn!',
                DT: {
                    totalRows: response.DT.totalRows,
                    validRows: response.DT.validRows,
                    errorRows: response.DT.errorRows,
                    details: response.DT.details,
                },
            };
        }

        // Trường hợp import thành công
        if (response.DT?.successCount !== undefined) {
            return {
                EC: 0,
                EM: `Import thành công ${response.DT.successCount}/${response.DT.totalProcessed} sách`,
                DT: response.DT,
            };
        }

        throw new Error('Phản hồi không hợp lệ từ server');
    } catch (error) {
        console.error('Import error:', error);
        return {
            EC: -1,
            EM: error.message || 'Có lỗi xảy ra khi import',
            DT: {
                error: error.message,
                details: [],
            },
        };
    }
};

export {
    getAllBook,
    addBook,
    getAllGenres,
    deleteBook,
    updateBook,
    addGenre,
    deleteGenre,
    createTransaction,
    getBookDetail,
    autoUpdateStatusInDB,
};
