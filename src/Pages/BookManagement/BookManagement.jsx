import React, { useEffect, useState, useRef } from 'react';
import {
    addBook,
    getAllBook,
    getAllGenres,
    deleteBook,
    updateBook,
    addGenre,
    importBooksFromExcel,
} from '../../services/bookManagerService';
import { toast } from 'react-toastify';
import { IoMdAdd } from 'react-icons/io';
import ModalAddBook from './ModalAddBook';
import ModalDeleteBook from './ModalDeleteBook';
import ModalUpdateBook from './ModalUpdateBook';
import ModalViewDetailBook from './ModalViewDetailBook';
import ModalAddGender from './ModalAddGender';
import ModalDeletegenres from './ModalDeleteGenres';
import { FaSearch } from 'react-icons/fa';
import Pagination from '../../components/Paginate/ReactPaginate';
import styles from '../UserManagement/UserManagement.module.css';
import ModalImportExcel from '../../components/ModalExcel/ModalImportExcel';

const BookManagementTable = () => {
    const [genres, setGenres] = useState([]);
    const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
    const [isOpenModalDelete, setIsOpenModalDelete] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isOpenModalUpdate, setIsOpenModalUpdate] = useState(false);
    const [bookToUpdate, setBookToUpdate] = useState(null);
    const [isOpenModalViewDetail, setIsOpenModalViewDetail] = useState(false);
    const [bookViewDetail, setBookViewDetail] = useState(null);
    const [isOpenModalAddGende, setIsOpenModalAddGende] = useState(false);
    const [isOpenModalDeleteGende, setIsOpenModalDeleteGende] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('none');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [currentLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isOpenModalImport, setIsOpenModalImport] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);
    useEffect(() => {
        if (importResult) {
            console.log('Import result:', importResult);
        }
    }, []);
    const handleCloseImportModal = () => {
        setIsOpenModalImport(false);
        // Chỉ refresh khi import thành công
        if (importResult && importResult.EC === 0) {
            fetchAllBook();
        }
        // Reset importResult sau khi đóng modal
        setTimeout(() => {
            setImportResult(null);
        }, 300);
    };

    useEffect(() => {
        fetchAllBook();
        fetchAllGenres();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setIsLoading(true);
            setHasSearched(false);
            const timer = setTimeout(() => {
                fetchAllBook();
                setHasSearched(true);
            }, 1000);
            return () => {
                clearTimeout(timer);
            };
        } else {
            setIsLoading(false);
            fetchAllBook();
        }
    }, [searchTerm, currentPage, sortOrder]);

    const fetchAllBook = async () => {
        try {
            setIsLoading(true);
            const response = await getAllBook(currentPage, currentLimit, searchTerm);
            if (response && response.EC === 0) {
                setTotalPage(response.DT.totalPages);
                let sortedBooks = [...response.DT.books] || [];

                // Sắp xếp sách theo số lượng
                if (sortOrder !== 'none') {
                    sortedBooks.sort((a, b) => {
                        if (sortOrder === 'asc') {
                            return a.quantity - b.quantity;
                        } else {
                            return b.quantity - a.quantity;
                        }
                    });
                }

                setFilteredBooks(sortedBooks);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchAllGenres = async () => {
        const response = await getAllGenres();
        if (response && response.EC === 0) {
            setGenres(response.DT);
        } else {
            toast.error(response.EM);
        }
    };

    const handleAddBook = async (bookData) => {
        try {
            const response = await addBook(bookData);
            if (response && response.EC === 0) {
                toast.success(response.EM);
                fetchAllBook();
                setIsOpenModalAdd(false);
            } else {
                toast.error(response.EM || 'Thêm sách thất bại');
            }
        } catch (error) {
            console.error('Error details:', error.response?.data || error);
            toast.error(error.response?.data?.EM);
        }
    };
    const handleOpenDeleteModal = (book) => {
        setBookToDelete(book);
        setIsOpenModalDelete(true);
    };

    const handleConfirmDelete = async (bookId) => {
        try {
            const response = await deleteBook(bookId);
            if (response && response.EC === 0) {
                toast.success(response.EM);
                fetchAllBook();
                setIsOpenModalDelete(false);
            } else {
                toast.error(response.EM || 'Xóa sách thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleOpenUpdateModal = (book) => {
        setBookToUpdate(book);
        setIsOpenModalUpdate(true);
    };

    const handleUpdateBook = async (bookId, bookData) => {
        try {
            const response = await updateBook(bookId, bookData);
            if (response && response.EC === 0) {
                await fetchAllBook();
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleAddGenre = async (genreName) => {
        try {
            const response = await addGenre(genreName);
            console.log('check res', response);
            if (response && +response.EC === 0) {
                toast.success(response.EM);
                await fetchAllGenres();
                // console.log('Genres updated:', genres);
                setIsOpenModalAddGende(false);
            } else if (response && +response.EC === 1) {
                toast.warning(response.EM);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleViewDetailModal = (book) => {
        setBookViewDetail(book);
        setIsOpenModalViewDetail(true);
    };

    const handlePageClick = (event) => {
        setCurrentPage(+event.selected + 1);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsLoading(true);
            const response = await importBooksFromExcel(formData);
            setImportResult(response);
            setIsOpenModalImport(true);

            if (response.EC === 0) {
                toast.success(response.EM);
                await fetchAllBook();
            } else if (response.EC === 1) {
                toast.warning('Dữ liệu Excel có lỗi, vui lòng kiểm tra chi tiết');
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Có lỗi xảy ra khi import');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="container mx-auto px-4 mt-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Sách Trong Thư Viện</h1>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-[70%]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="w-full md:w-[28%]">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                        <option value="none">Sắp xếp theo số lượng</option>
                        <option value="desc">Nhiều nhất → Ít nhất</option>
                        <option value="asc">Ít nhất → Nhiều nhất</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsOpenModalAdd(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 flex items-center gap-2"
                    >
                        <IoMdAdd />
                        Thêm sách
                    </button>
                    <button
                        onClick={() => setIsOpenModalAddGende(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 flex items-center gap-2"
                    >
                        <IoMdAdd />
                        Thêm thể loại sách
                    </button>
                    <button
                        onClick={() => setIsOpenModalDeleteGende(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 flex items-center gap-2"
                    >
                        <IoMdAdd />
                        Xem thể loại sách
                    </button>
                </div>
                <div>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportExcel}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <IoMdAdd />
                                Import Excel
                            </>
                        )}
                    </button>
                </div>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200 text-white">
                        <th className="border bg-[#020617] px-4 py-2">ID Sách</th>
                        <th className="border bg-[#020617] px-4 py-2">Ảnh Bìa</th>
                        <th className="border bg-[#020617] px-4 py-2">Tên Sách</th>
                        <th className="border bg-[#020617] px-4 py-2">Tác Giả</th>
                        <th className="border bg-[#020617] px-4 py-2">Thể Loại</th>
                        <th className="border bg-[#020617] px-4 py-2">Số Lượng</th>
                        <th className="border bg-[#020617] px-4 py-2">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang tìm kiếm...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <tr key={book.id} className="text-center">
                                <td className="border text-center px-4 py-2">{book.id}</td>
                                <td className="border text-center px-4 py-2">
                                    {book.cover_image ? (
                                        <img
                                            src={book.cover_image}
                                            alt={book.title}
                                            className="w-12 h-12 object-cover mx-auto"
                                        />
                                    ) : (
                                        'Không có ảnh'
                                    )}
                                </td>
                                <td className="border text-center px-4 py-2 max-w-[200px] truncate">{book.title}</td>
                                <td className="border text-center px-4 py-2 max-w-[150px] truncate">{book.author}</td>
                                <td className="border text-center px-4 py-2 max-w-[150px] truncate">
                                    {book.Genre?.name || 'Không có thể loại'}
                                </td>
                                <td className="border text-center px-4 py-2">
                                    <span className={book.quantity === 0 ? 'text-red-500 font-bold' : ''}>
                                        {book.quantity === 0 ? 'Hết sách' : book.quantity}
                                    </span>
                                </td>
                                <td className="border text-center px-4 py-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                        onClick={() => handleViewDetailModal(book)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                        onClick={() => handleOpenUpdateModal(book)}
                                    >
                                        Chỉnh Sửa
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleOpenDeleteModal(book)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-4">
                                {searchTerm ? 'Không tìm thấy sách phù hợp' : 'Không có dữ liệu'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isOpenModalAdd && (
                <ModalAddBook setIsOpenModalAdd={setIsOpenModalAdd} handleAddBook={handleAddBook} genres={genres} />
            )}
            {isOpenModalDelete && (
                <ModalDeleteBook
                    setIsOpenModalDelete={setIsOpenModalDelete}
                    bookToDelete={bookToDelete}
                    handleConfirmDelete={handleConfirmDelete}
                />
            )}
            {isOpenModalUpdate && (
                <ModalUpdateBook
                    setIsOpenModalUpdate={setIsOpenModalUpdate}
                    bookToUpdate={bookToUpdate}
                    handleUpdateBook={handleUpdateBook}
                />
            )}
            {isOpenModalViewDetail && (
                <ModalViewDetailBook
                    setIsOpenModalViewDetail={setIsOpenModalViewDetail}
                    bookViewDetail={bookViewDetail}
                />
            )}
            {isOpenModalAddGende && (
                <ModalAddGender setIsOpenModalAddGende={setIsOpenModalAddGende} handleAddGenre={handleAddGenre} />
            )}
            {isOpenModalDeleteGende && <ModalDeletegenres setIsOpenModalDeleteGenre={setIsOpenModalDeleteGende} />}

            {totalPage > 0 && (
                <footer className="mt-4">
                    <Pagination
                        pageCount={totalPage}
                        currentPage={currentPage}
                        onPageChange={handlePageClick}
                        customStyles={styles}
                    />
                </footer>
            )}

            <ModalImportExcel isOpen={isOpenModalImport} onClose={handleCloseImportModal} importResult={importResult}>
                {importResult && importResult.EC !== 0 && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        <p className="font-bold mb-2">{importResult.EM}</p>
                        {importResult.DT && (
                            <>
                                {importResult.DT.error && (
                                    <p className="text-red-600 mb-2">Lỗi: {importResult.DT.error}</p>
                                )}
                                {importResult.DT.details && importResult.DT.details.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold">Chi tiết lỗi:</p>
                                        <ul className="list-disc list-inside mt-1">
                                            {importResult.DT.details.map((detail, index) => (
                                                <li key={index} className="text-red-600">
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </ModalImportExcel>
        </div>
    );
};

export default BookManagementTable;
