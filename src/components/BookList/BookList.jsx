import React, { useEffect, useState } from 'react';
import { getAllBook, getAllGenres } from '../../services/bookManagerService';
import { toast } from 'react-toastify';

function BookList() {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);

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
            const filtered = books.filter(book => book.genreId === parseInt(selectedGenre));
            setFilteredBooks(filtered);
        }
    };

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value);
    };

    return (
        <div className="w-[95%] md:w-[90%] mx-auto p-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-4">
                Tủ Sách Thư Viện Đại học Khoa Học Huế
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
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>

                            {/* Book Info */}
                            <div className="p-4 flex flex-col flex-grow">
                                <h2 className="text-base md:text-lg font-bold line-clamp-2 mb-2">{book.title}</h2>
                                <p className="text-sm md:text-base text-gray-600 mb-2 line-clamp-1">
                                    Tác Giả: {book.author}
                                </p>
                                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-1">
                                    Số Lượng: {book.quantity}
                                </p>
                                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-1">
                                    Thể loại: {getGenreName(book.genreId)}
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-2 mt-auto">
                                    <button className="flex-1 bg-blue-500 text-white hover:bg-blue-700 hover:text-white border border-blue-700 transition-colors duration-3 00 rounded-md p-2 text-sm md:text-base">
                                        Mượn
                                    </button>
                                    <button className="flex-1 bg-white text-blue-500 border border-blue-500 transition-colors duration-300 rounded-md p-2 text-sm md:text-base">
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
        </div>
    );
}

export default BookList;
