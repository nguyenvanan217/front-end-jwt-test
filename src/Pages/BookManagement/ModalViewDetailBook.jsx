import React from 'react';
import { FaRegWindowClose } from 'react-icons/fa';

function ModalViewDetailBook({ setIsOpenModalViewDetail, bookViewDetail }) {
    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpenModalViewDetail(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[800px] h-[700px] relative top-[5%] modal-slide-down overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-500 pb-3">
                    <h2 className="text-xl font-bold text-blue-600">Chi Tiết Sách</h2>
                    <button onClick={() => setIsOpenModalViewDetail(false)} className="text-red-500 hover:text-red-700">
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Cover Image with larger size */}
                <div className="mt-4 h-[300px] flex justify-center items-center bg-gray-50">
                    <img 
                        src={bookViewDetail?.cover_image} 
                        alt={bookViewDetail?.title} 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                            e.target.src = '/assets/default-book.png'; // Add a default image
                            e.target.onerror = null;
                        }}
                    />
                </div>

                {/* Book Details */}
                <div className="mt-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Sách</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-blue-500">
                                {bookViewDetail?.id || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Sách</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-blue-500">
                                {bookViewDetail?.title || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Author and Genre */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tác Giả</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-blue-500">
                                {bookViewDetail?.author || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thể Loại</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-blue-500">
                                {bookViewDetail?.Genre?.name || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Quantity and Status */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-blue-500">
                                {bookViewDetail?.quantity || '0'} cuốn
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                            <div className={`p-2 rounded-md ${
                                bookViewDetail?.quantity > 0 
                                    ? 'bg-green-100 text-green-800 border border-green-500' 
                                    : 'bg-red-100 text-red-800 border border-red-500'
                            }`}>
                                {bookViewDetail?.quantity > 0 ? 'Còn sách' : 'Hết sách'}
                            </div>
                        </div>
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh Bìa</label>
                        <div className="p-2 bg-gray-50 rounded-md border border-blue-500 break-all">
                            {bookViewDetail?.cover_image || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setIsOpenModalViewDetail(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalViewDetailBook;
