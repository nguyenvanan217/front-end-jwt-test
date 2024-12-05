import React, { useState, useEffect } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllGenres } from '../../services/bookManagerService';

function ModalUpdateBook({ setIsOpenModalUpdate, handleUpdateBook, bookToUpdate }) {
    const [bookData, setBookData] = useState({
        title: bookToUpdate.title || '',
        author: bookToUpdate.author || '',
        genre_name: bookToUpdate.Genre?.name || '',
        quantity: bookToUpdate.quantity || '',
        cover_image: bookToUpdate.cover_image || '',
    });

    const [genres, setGenres] = useState([]);

    useEffect(() => {
        fetchGenres();
    }, []);

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

    const [errors, setErrors] = useState({
        title: '',
        author: '',
        genre_name: '',
        quantity: '',
        cover_image: '',
    });

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            title: '',
            author: '',
            genre_name: '',
            quantity: '',
            cover_image: '',
        };

        if (!bookData.title.trim()) {
            newErrors.title = 'Bạn chưa nhập tên sách';
            isValid = false;
        }

        if (!bookData.author.trim()) {
            newErrors.author = 'Bạn chưa nhập tên tác giả';
            isValid = false;
        }

        if (!bookData.genre_name) {
            newErrors.genre_name = 'Vui lòng chọn thể loại';
            isValid = false;
        }

        if (!bookData.quantity) {
            newErrors.quantity = 'Bạn chưa nhập số lượng';
            isValid = false;
        } else if (parseInt(bookData.quantity) < 0) {
            newErrors.quantity = 'Số lượng không thể là số âm';
            isValid = false;
        }

        if (!bookData.cover_image.trim()) {
            newErrors.cover_image = 'Bạn chưa nhập URL ảnh bìa';
            isValid = false;
        } else if (!validateUrl(bookData.cover_image)) {
            newErrors.cover_image = 'URL ảnh không hợp lệ';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOnChangeInput = (e, field) => {
        setBookData({
            ...bookData,
            [field]: e.target.value,
        });
        setErrors({
            ...errors,
            [field]: '',
        });
    };

    const handleGenreChange = (e) => {
        const selectedGenre = genres.find(genre => genre.name === e.target.value);
        setBookData({
            ...bookData,
            genre_name: e.target.value
        });
        setErrors({
            ...errors,
            genre_name: ''
        });
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            const response = await handleUpdateBook(bookToUpdate.id, bookData);
            
            if (response && response.EC === 0) {
                toast.success(response.EM);
                setIsOpenModalUpdate(false);
            } else if (response && response.EC === 1 && response.EM === 'Nothing to update') {
                toast.warning(response.EM);
            } else {
                toast.error(response.EM || 'Cập nhật sách thất bại');
            }
        } else {
            toast.error('Vui lòng kiểm tra lại thông tin nhập vào!');
        }
    };

    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpenModalUpdate(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[500px] h-[470px] relative top-[10%] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-500 pb-3">
                    <h2 className="text-xl font-bold text-blue-600">Cập Nhật Thông Tin Sách</h2>
                    <button onClick={() => setIsOpenModalUpdate(false)} className="text-red-500 hover:text-red-700">
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="mt-4 space-y-4 flex-grow">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Sách</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.title ? 'border-red-500' : 'border-blue-500'
                                } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                                value={bookData.title}
                                onChange={(e) => handleOnChangeInput(e, 'title')}
                            />
                            <div className="h-5">
                                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tác Giả</label>
                            <input
                                type="text"
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.author ? 'border-red-500' : 'border-blue-500'
                                } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                                value={bookData.author}
                                onChange={(e) => handleOnChangeInput(e, 'author')}
                            />
                            <div className="h-5">
                                {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thể Loại</label>
                            <select
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.genre_name ? 'border-red-500' : 'border-blue-500'
                                } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                                value={bookData.genre_name}
                                onChange={handleGenreChange}
                            >
                                <option value="">Chọn thể loại</option>
                                {genres.map((genre) => (
                                    <option key={genre.id} value={genre.name}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                            <div className="h-5">
                                {errors.genre_name && <p className="text-red-500 text-sm">{errors.genre_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số Lượng</label>
                            <input
                                type="number"
                                className={`mt-1 block w-full rounded-md border ${
                                    errors.quantity ? 'border-red-500' : 'border-blue-500'
                                } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                                min={0}
                                value={bookData.quantity}
                                onChange={(e) => handleOnChangeInput(e, 'quantity')}
                            />
                            <div className="h-5">
                                {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL Ảnh Bìa</label>
                        <input
                            type="text"
                            className={`mt-1 block w-full rounded-md border ${
                                errors.cover_image ? 'border-red-500' : 'border-blue-500'
                            } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                            value={bookData.cover_image}
                            onChange={(e) => handleOnChangeInput(e, 'cover_image')}
                        />
                        <div className="h-5">
                            {errors.cover_image && <p className="text-red-500 text-sm">{errors.cover_image}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setIsOpenModalUpdate(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Cập Nhật
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalUpdateBook;
