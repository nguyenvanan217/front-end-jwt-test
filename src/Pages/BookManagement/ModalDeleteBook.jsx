import React from 'react';
import { FaRegWindowClose } from 'react-icons/fa';

function ModalDeleteBook({ setIsOpenModalDelete, bookToDelete, handleConfirmDelete }) {
    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-[1000]"
            onClick={() => setIsOpenModalDelete(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[450px] h-[260px] relative top-[30%] modal-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                    <h2 className="text-xl font-bold text-red-600">Xác nhận xóa sách</h2>
                    <button onClick={() => setIsOpenModalDelete(false)} className="text-red-500 hover:text-red-700">
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="my-4">
                    <p className="text-gray-600">Bạn có chắc chắn muốn xóa cuốn sách:</p>
                    <p className="font-semibold text-gray-800 mt-2 max-w-[100%] truncate">{bookToDelete?.title}</p>
                    <p className="text-red-600 text-sm mt-2">
                        <strong>*Lưu ý:</strong> Chỉ có thể xóa sách khi không có giao dịch mượn đang chờ trả hoặc quá
                        hạn
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setIsOpenModalDelete(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => handleConfirmDelete(bookToDelete.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalDeleteBook;
