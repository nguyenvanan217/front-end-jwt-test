import axios from '../setup/axios';

const getAllBook = async () => {
    const URL_API = '/api/v1/books/read';
    return axios.get(URL_API);
};

const getAllGenres = async () => {
    return axios.get('/api/v1/genres/read');
};

const addBook = async (bookData) => {
    console.log('bookData', bookData);
    return axios.post('/api/v1/books/create', {
        title: bookData.title,
        author: bookData.author,
        quantity: bookData.quantity,
        cover_image: bookData.cover_image,
        genre_name: bookData.genre_name
    });
};

export { getAllBook, addBook, getAllGenres };
