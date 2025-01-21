import React, { useEffect, useState } from 'react';
import { getAllBook, getAllGenres } from '../../services/bookManagerService';
import { toast } from 'react-toastify';
import ModalBookDetail from './ModalBookDetail';

function BookList() {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isModalBooksDetailOpen, setIsModalBooksDetailOpen] = useState(false);

    useEffect(() => {
        fetchAllBook();
        fetchGenres();
    }, []);

    useEffect(() => {
        filterBooks();
    }, [books, selectedGenre]);

    const fetchAllBook = async () => {
        try {
            const response = await getAllBook();
            console.log(response);
            if (response && response.EC === 0) {
                setBooks(response.DT);
                setFilteredBooks(response.DT);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const fetchGenres = async () => {
        try {
            const response = await getAllGenres();
            if (response && response.EC === 0) {
                setGenres(response.DT);
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const getGenreName = (genreId) => {
        const genre = genres.find((g) => g.id === genreId);
        return genre ? genre.name : 'Chưa phân loại';
    };

    const filterBooks = () => {
        if (!selectedGenre) {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter((book) => book.genreId === parseInt(selectedGenre));
            setFilteredBooks(filtered);
        }
    };

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value);
    };

    const handleBtnDetailBook = (book) => {
        setSelectedBook(book);
        setIsModalBooksDetailOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsModalBooksDetailOpen(false);
        setSelectedBook(null);
    };

    return (
        <div className="w-[95%] md:w-[90%] mx-auto p-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-4">
                Tủ Sách Thư Viện Đại Học Khoa Học Huế
            </h1>

            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <strong className="text-sm md:text-base">Bộ Lọc: </strong>
                <select
                    className="border border-blue-500 focus:outline-none rounded-md p-1 text-sm md:text-base"
                    value={selectedGenre}
                    onChange={handleGenreChange}
                >
                    <option value="">Tất cả sách</option>
                    {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Books Grid */}
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-full"
                        >
                            {/* Book Image */}
                            <div className="relative pt-[140%]">
                                <div className="hover:opacity-80 cursor-pointer">
                                    <img
                                        src={book.cover_image}
                                        alt={book.title}
                                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        onClick={() => handleBtnDetailBook(book)}
                                    />
                                </div>
                            </div>

                            {/* Book Info */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h2
                                    className="text-base md:text-lg font-bold line-clamp-2 mb-2 cursor-pointer"
                                    onClick={() => handleBtnDetailBook(book)}
                                >
                                    {book.title}
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 mb-2 line-clamp-1">
                                    Số Lượng: {book.quantity}
                                </p>
                                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-1">
                                    Thể loại: {getGenreName(book.genreId)}
                                </p>

                                {/* Chỉ giữ lại nút Chi tiết */}
                                <div className="flex justify-center mt-auto">
                                    <button
                                        className="w-full bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-300 rounded-md p-2 text-sm md:text-base"
                                        onClick={() => handleBtnDetailBook(book)}
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Data Message */}
                {filteredBooks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Không có sách nào trong thư viện</div>
                )}
            </div>
            <ModalBookDetail isOpen={isModalBooksDetailOpen} onClose={handleCloseDetailModal} book={selectedBook} />
        </div>
    );
}

export default BookList;
