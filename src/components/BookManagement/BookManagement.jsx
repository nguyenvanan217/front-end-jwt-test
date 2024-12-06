import React, { useEffect, useState } from 'react';
import { addBook, getAllBook, getAllGenres, deleteBook, updateBook, addGenre } from '../../services/bookManagerService';
import { toast } from 'react-toastify';
import { IoMdAdd } from 'react-icons/io';
import ModalAddBook from './ModalAddBook';
import ModalDeleteBook from './ModalDeleteBook';
import ModalUpdateBook from './ModalUpdateBook';
import ModalViewDetailBook from './ModalViewDetailBook';
import ModalAddGender from './ModalAddGender';
import ModalDeletegenres from './ModalDeleteGenres';
const BookManagementTable = () => {
    const [books, setBooks] = useState([]);
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
    useEffect(() => {
        fetchAllBook();
        fetchAllGenres();
    }, []);

    const fetchAllBook = async () => {
        try {
            const response = await getAllBook();
            if (response && response.EC === 0) {
                setBooks(response.DT);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.log(error);
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
            console.log('Sending book data:', bookData);
            const response = await addBook(bookData);
            console.log('Response:', response);

            if (response && response.EC === 0) {
                toast.success(response.EM);
                fetchAllBook();
                setIsOpenModalAdd(false);
            } else {
                toast.error(response.EM || 'Thêm sách thất bại');
            }
        } catch (error) {
            console.error('Error details:', error.response?.data || error);
            toast.error(error.response?.data?.EM || 'Có lỗi xảy ra khi thêm sách');
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
            toast.error('Có lỗi xảy ra khi xóa sách');
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
            toast.error('Có lỗi xảy ra khi cập nhật sách');
        }
    };
    const handleAddGenre = async (genreName) => {
        try {
            const response = await addGenre(genreName);
            console.log('check res', response);
            if (response && +response.EC === 0) {
                toast.success(response.EM);
                await fetchAllGenres();
                console.log('Genres updated:', genres);
                setIsOpenModalAddGende(false);
            } else if (response && +response.EC === 1) {
                toast.warning(response.EM);
            } else {
                toast.error(response.EM || 'Thêm thể loại thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Có lỗi xảy ra khi thêm thể loại');
        }
    };

    const handleViewDetailModal = (book) => {
        setBookViewDetail(book);
        setIsOpenModalViewDetail(true);
    };

    return (
        <div className="container mx-auto px-4 my-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Sách Trong Thư Viện</h1>
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
                    Xóa thể loại sách
                </button>
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
                    {books && books.length > 0 ? (
                        books.map((book) => (
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
                                <td className="border text-center px-4 py-2">{book.quantity}</td>
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
                                Không có dữ liệu
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
        </div>
    );
};

export default BookManagementTable;
