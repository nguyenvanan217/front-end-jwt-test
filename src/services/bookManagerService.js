import axios from '../setup/axios';

const getAllBook = async () => {
    const URL_API = '/api/v1/books/read';
    return axios.get(URL_API);
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

export { getAllBook, addBook, getAllGenres, deleteBook, updateBook };
