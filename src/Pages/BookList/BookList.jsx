import React, { useEffect, useState, useRef } from 'react';
import { getAllBook, getAllGenres, importBooksFromExcel } from '../../services/bookManagerService';
import { toast } from 'react-toastify';
import ModalBookDetail from './ModalBookDetail';
import ModalBorrowBooks from './ModalBorrowBooks';
import Pagination from '../../components/Paginate/ReactPaginate';
import styles from '../UserManagement/UserManagement.module.css';
function BookList() {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isModalBooksDetailOpen, setIsModalBooksDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalBorrowOpen, setIsModalBorrowOpen] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [isOpenModalImport, setIsOpenModalImport] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAllBook();
        fetchGenres();
    }, [currentPage, currentLimit, searchTerm]);

    useEffect(() => {
        if (selectedGenre || searchTerm) {
            filterAndSearchBooks();
        }
    }, [selectedGenre, searchTerm, books]);

    const fetchAllBook = async () => {
        try {
            setIsLoading(true);
            const response = await getAllBook(currentPage, currentLimit, searchTerm);
            if (response && response.EC === 0) {
                setBooks(response.DT.books);
                setFilteredBooks(response.DT.books);
                setTotalPage(response.DT.totalPages);
                setCurrentPage(response.DT.currentPage);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };
    const handlePageClick = (event) => {
        setCurrentPage(+event.selected + 1);
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

    const filterAndSearchBooks = () => {
        let filtered = [...books];

        if (selectedGenre) {
            filtered = filtered.filter((book) => book.genreId === parseInt(selectedGenre));
        }

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(
                (book) =>
                    book.title.toLowerCase().includes(searchLower) || book.author.toLowerCase().includes(searchLower),
            );
        }

        setFilteredBooks(filtered);
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleOpenBorrowModal = (book) => {
        if (book.quantity <= 0) {
            toast.error('Sách này hiện đã hết, vui lòng chọn sách khác');
            return;
        }
        setSelectedBook(book);
        setIsModalBorrowOpen(true);
    };

    const handleCloseBorrowModal = () => {
        setIsModalBorrowOpen(false);
        setSelectedBook(null);
    };

    const updateBookQuantity = (bookId) => {
        setBooks((prevBooks) =>
            prevBooks.map((book) => (book.id === bookId ? { ...book, quantity: book.quantity - 1 } : book)),
        );
        setFilteredBooks((prevBooks) =>
            prevBooks.map((book) => (book.id === bookId ? { ...book, quantity: book.quantity - 1 } : book)),
        );
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await importBooksFromExcel(formData);
            setImportResult(response);
            setIsOpenModalImport(true);
            
            // Chỉ refresh danh sách khi import thành công
            if (response && response.EC === 0) {
                await fetchAllBook();
            }
        } catch (error) {
            console.error('Import error:', error);
            const errorResult = error.response?.data || {
                EM: "Lỗi khi import file Excel",
                EC: -1,
                DT: { error: error.message }
            };
            setImportResult(errorResult);
            setIsOpenModalImport(true);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleCloseImportModal = () => {
        setIsOpenModalImport(false);
        // Không cần gọi fetchAllBook ở đây vì đã gọi trong handleImportExcel
        setImportResult(null);
    };

    return (
        <div className="w-[95%] md:w-[90%] mx-auto mt-4 mb-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-4">
                Tủ Sách Thư Viện Đại Học Khoa Học Huế
            </h1>

            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Input */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sách hoặc tên tác giả..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {/* Genre Filter */}
                <div className="w-full md:w-64">
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={selectedGenre}
                        onChange={handleGenreChange}
                    >
                        <option value="">Tất cả thể loại</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Books Grid */}
            <div className="w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                ) : (
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
                                    <div className="flex justify-center gap-2 mt-auto">
                                        <button
                                            className="w-1/2 bg-blue-500 text-white hover:bg-blue-700 transition-colors duration-300 rounded-md p-2 text-sm md:text-base"
                                            onClick={() => handleBtnDetailBook(book)}
                                        >
                                            Chi tiết
                                        </button>
                                        <button
                                            className={`w-1/2 ${
                                                book.quantity > 0
                                                    ? 'bg-green-500 hover:bg-green-700'
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            } text-white transition-colors duration-300 rounded-md p-2 text-sm md:text-base`}
                                            onClick={() => handleOpenBorrowModal(book)}
                                            disabled={book.quantity <= 0}
                                        >
                                            {book.quantity > 0 ? 'Mượn sách' : 'Hết sách'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredBooks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Không tìm thấy sách phù hợp' : 'Không có dữ liệu'}
                    </div>
                )}
            </div>
            <footer>
                <Pagination
                    pageCount={totalPage}
                    currentPage={currentPage}
                    onPageChange={handlePageClick}
                    customStyles={styles}
                />
            </footer>
            <ModalBookDetail isOpen={isModalBooksDetailOpen} onClose={handleCloseDetailModal} book={selectedBook} />
            <ModalBorrowBooks
                isOpen={isModalBorrowOpen}
                onClose={handleCloseBorrowModal}
                book={selectedBook}
                onBorrowSuccess={updateBookQuantity}
            />
        </div>
    );
}

export default BookList;
