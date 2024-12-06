import React from 'react';
import { FaRegWindowClose } from 'react-icons/fa';

function ModalViewDetailBook({ setIsOpenModalViewDetail, bookViewDetail }) {
    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpenModalViewDetail(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[800px] h-[600px] relative top-[10%] modal-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-500 pb-3">
                    <h2 className="text-xl font-bold text-blue-600">Chi Tiết Sách</h2>
                    <button onClick={() => setIsOpenModalViewDetail(false)} className="text-red-500 hover:text-red-700">
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Cover Image */}
                <div className="mt-4 h-[200px] flex justify-center items-center border border-blue-500 rounded-md">
                    <img src={bookViewDetail?.cover_image} alt="Book cover" className="max-h-full max-w-full object-contain" />
                </div>

                {/* Form Content */}
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Sách</label>
                            <input
                                type="text"
                                value={bookViewDetail?.id || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Sách</label>
                            <input
                                type="text"
                                value={bookViewDetail?.title || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tác Giả</label>
                            <input
                                type="text"
                                value={bookViewDetail?.author || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thể Loại</label>
                            <input
                                type="text"
                                value={bookViewDetail?.Genre?.name || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng</label>
                            <input
                                type="text"
                                value={bookViewDetail?.quantity || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh Bìa</label>
                            <input
                                type="text"
                                value={bookViewDetail?.cover_image || ''}
                                className="mt-1 block w-full rounded-md border border-blue-500 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none"
                                readOnly
                            />
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
