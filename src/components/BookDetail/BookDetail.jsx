import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookDetail } from '../../services/bookManagerService';
import { getAllGenres } from '../../services/genreService';
import { toast } from 'react-toastify';
import ModalBorrowBooks from '../BookList/ModalBorrowBooks';

const BookDetail = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookResponse, genresResponse] = await Promise.all([
                    getBookDetail(id),
                    getAllGenres()
                ]);
                
                if (bookResponse.EC === 0) {
                    setBook(bookResponse.DT);
                }
                if (genresResponse.EC === 0) {
                    setGenres(genresResponse.DT);
                }
            } catch (error) {
                toast.error('Không thể tải thông tin sách');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getGenreName = (genreId) => {
        const genre = genres.find(g => g.id === genreId);
        return genre ? genre.name : 'Chưa phân loại';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!book) {
        return <div className="text-center mt-10">Không tìm thấy sách</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hình ảnh sách */}
                <div className="flex justify-center">
                    <img 
                        src={book.cover_image} 
                        alt={book.title}
                        className="rounded-lg shadow-lg max-h-[500px] object-contain"
                    />
                </div>

                {/* Thông tin sách */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Tác giả</h2>
                            <p className="text-gray-600">{book.author}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Thể loại</h2>
                            <p className="text-gray-600">{getGenreName(book.genreId)}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Số lượng có sẵn</h2>
                            <p className="text-gray-600">{book.quantity} cuốn</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Ngày cập nhật</h2>
                            <p className="text-gray-600">
                                {new Date(book.updatedAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Nút mượn sách */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={book.quantity === 0}
                            className={`w-full py-3 px-6 rounded-md text-white font-medium
                                ${book.quantity > 0 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-gray-400 cursor-not-allowed'}
                            `}
                        >
                            {book.quantity > 0 ? 'Mượn Sách' : 'Hết Sách'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal mượn sách */}
            <ModalBorrowBooks
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                book={book}
            />
        </div>
    );
};

export default BookDetail; 