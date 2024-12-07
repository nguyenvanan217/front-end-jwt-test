import React, { useState, useEffect } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import '../modalUser/Modal.css';
import { getAllGenres } from '../../services/bookManagerService';

const ModalBookDetail = ({ isOpen, onClose, book }) => {
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

    const getGenreName = (genreId) => {
        const genre = genres.find((g) => g.id === genreId);
        return genre ? genre.name : 'Chưa phân loại';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-4xl modal-slide-down">
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold text-gray-900">Chi Tiết Sách</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <FaRegWindowClose size={24} color="red" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Image */}
                            <div className="flex justify-center items-start">
                                <img
                                    src={book?.cover_image}
                                    alt={book?.title}
                                    className="rounded-lg shadow-lg max-h-[400px] object-contain"
                                />
                            </div>

                            {/* Right Column - Book Details */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-5 min-h-[3rem]">{book?.title}</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Tác giả</h3>
                                            <p className="text-gray-600">{book?.author}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Thể loại</h3>
                                            <p className="text-gray-600">{getGenreName(book?.genreId)}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Số lượng hiện có</h3>
                                            <p className="text-gray-600">{book?.quantity} cuốn</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Mã sách</h3>
                                            <p className="text-gray-600">#{book?.id}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Trạng thái</h3>
                                            <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                                                ${book?.quantity > 0 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'}`}>
                                                {book?.quantity > 0 ? 'Còn sách' : 'Hết sách'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalBookDetail; 