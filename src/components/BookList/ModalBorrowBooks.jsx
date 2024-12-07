import React, { useState, useEffect } from 'react';
import '../modalUser/Modal.css';
import { FaRegWindowClose } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ModalBorrowBooks = ({ isOpen, onClose, book }) => {
    
    const [borrowDate, setBorrowDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const addDays = (dateStr, days) => {
        if (!dateStr) return '';

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return ''; 

        date.setDate(date.getDate() + parseInt(days));

        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    
    const getCurrentDate = () => {
        const now = new Date();
        
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        return vietnamTime.toISOString().split('T')[0];
    };

    
    useEffect(() => {
        if (isOpen) {
            setBorrowDate(getCurrentDate());
            setReturnDate('');
            setError('');
            setTouched(false);
        }
    }, [isOpen]);

    const handleReturnDateChange = (e) => {
        setTouched(true);
        const selectedDate = e.target.value;
        
    
        if (selectedDate.length < 10) { 
            setReturnDate(selectedDate);
            return;
        }

        const maxDate = addDays(borrowDate, 20);
    
        const selectedDateTime = new Date(selectedDate).getTime();
        const borrowDateTime = new Date(borrowDate).getTime();
        const maxDateTime = new Date(maxDate).getTime();

        if (!selectedDate) {
            setError('Vui lòng chọn ngày trả sách');
            setReturnDate('');
            return;
        }

        if (selectedDateTime < borrowDateTime) {
            setError('Ngày trả không thể trước ngày mượn');
            setReturnDate(selectedDate);
            return;
        }

        if (selectedDateTime > maxDateTime) {
            setError('Thời gian mượn không được vượt quá 20 ngày');
            setReturnDate(selectedDate); 
            toast.error('Thời gian mượn không được vượt quá 20 ngày');
            return;
        }

        setReturnDate(selectedDate);
        setError('');
    };

    const handleSubmit = () => {
        setTouched(true);
        if (!returnDate) {
            setError('Vui lòng chọn ngày trả sách');
            toast.error('Vui lòng chọn ngày trả sách');
            return;
        }
        
        // Xử lý submit form ở đây
        toast.success('Gửi yêu cầu mượn sách thành công!');
        onClose();
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
                            <h3 className="text-xl font-semibold text-gray-900">Xác Nhận Mượn Sách</h3>
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
                                    <h4 className="font-semibold text-lg line-clamp-2 ">{book?.title}</h4>
                                    <p className="text-gray-600 mt-1">Tác giả: {book?.author}</p>
                                </div>
                            </div>

                            {/* Borrow Details */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày mượn</label>
                                    <input
                                        type="date"
                                        value={borrowDate}
                                        disabled 
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ngày trả dự kiến: (Tối đa mượn trong 20 ngày)
                                    </label>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={handleReturnDateChange}
                                        min={borrowDate}
                                        max={addDays(borrowDate, 20)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 
                                            ${touched && error ? 'border-red-500' : 'border-gray-300'} 
                                            focus:border-blue-500`}
                                    />
                                    {touched && error && (
                                        <p className="text-red-500 text-sm mt-1">{error}</p>
                                    )}
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
                            Gửi yêu cầu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalBorrowBooks;
