import React, { useState, useEffect } from 'react';
import '../../components/modalUser/Modal.css';
import { FaRegWindowClose } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createTransaction } from '../../services/bookManagerService';

const ModalBorrowBooks = ({ isOpen, onClose, book, onBorrowSuccess }) => {
    const [studentEmail, setStudentEmail] = useState('');
    const [borrowDate, setBorrowDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [errors, setErrors] = useState({});

    const getCurrentDate = () => {
        const now = new Date();

        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        return vietnamTime.toISOString().split('T')[0];
    };

    const calculateReturnDate = (borrowDate) => {
        const date = new Date(borrowDate);
        date.setDate(date.getDate() + 20);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (isOpen) {
            const currentDate = getCurrentDate();
            setBorrowDate(currentDate);
            setReturnDate(calculateReturnDate(currentDate));
            setStudentEmail('');
            setErrors({});
        }
    }, [isOpen]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        const newErrors = {};

        if (book.quantity <= 0) {
            toast.error('Sách này hiện đã hết, vui lòng chọn sách khác');
            onClose();
            return;
        }

        if (!studentEmail.trim()) {
            newErrors.email = 'Vui lòng nhập email sinh viên';
        } else if (!validateEmail(studentEmail)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await createTransaction({
                bookId: book.id,
                studentEmail: studentEmail.trim(),
                borrowDate: borrowDate,
                returnDate: returnDate,
                quantity: book.quantity,
            });

            if (response && response.EC === 0) {
                toast.success(response.EM);
                onBorrowSuccess(book.id);
                onClose();
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.error('Lỗi khi đăng ký mượn sách:', error);
            toast.error('Không thể đăng ký mượn sách');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg modal-slide-down">
                    {' '}
                    {/* Added modal-slide-down class */}
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Đăng ký mượn sách</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                                <span className="sr-only">Close</span>
                                <FaRegWindowClose size={20} color="red" />
                            </button>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="bg-white px-6 py-4">
                        <div className="space-y-4">
                            {/* Book Info */}
                            <div className="flex gap-4">
                                <img
                                    src={book?.cover_image}
                                    alt={book?.title}
                                    className="w-24 h-32 object-cover rounded"
                                />
                                <div>
                                    <h4 className="font-semibold text-lg line-clamp-2">{book?.title}</h4>
                                    <p className="text-gray-600 mt-1">Tác giả: {book?.author}</p>
                                    <p className={`mt-1 ${book.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Số lượng còn lại: {book?.quantity}
                                    </p>
                                </div>
                            </div>

                            {/* Borrow Details */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email sinh viên</label>
                                    <input
                                        type="email"
                                        value={studentEmail}
                                        onChange={(e) => setStudentEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Nhập email sinh viên"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày mượn</label>
                                    <input
                                        type="date"
                                        value={borrowDate}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày trả</label>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                                    />
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
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalBorrowBooks;
