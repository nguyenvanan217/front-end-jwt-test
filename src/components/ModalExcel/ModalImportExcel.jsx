import React, { useEffect } from 'react';

const ModalImportExcel = ({ isOpen, onClose, importResult }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Kết quả Import Excel</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                {importResult ? (
                    <div>
                        {importResult.EC === 0 ? (
                            // Thành công
                            <div className="p-4 bg-green-100 rounded">
                                <p className="font-bold text-green-700 mb-4">{importResult.EM}</p>
                                {importResult.DT?.books?.length > 0 && (
                                    <div className="space-y-2">
                                        {importResult.DT.books.map((book, index) => (
                                            <p key={index} className="text-green-600">
                                                ✓ {book.title} - {book.status === 'created' ? 'Thêm mới' : 'Cập nhật'}
                                                {book.addedQuantity ? ` (+${book.addedQuantity})` : ''}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Lỗi
                            <div className="p-4 bg-red-100 rounded">
                                <p className="font-bold text-red-700 mb-2">{importResult.EM}</p>
                                {importResult.DT?.error && <p className="text-red-600">{importResult.DT.error}</p>}
                                {importResult.DT?.details?.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {importResult.DT.details.map((detail, index) => (
                                            <li key={index} className="text-red-600">
                                                • {detail}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Đang xử lý...</p>
                )}
            </div>
        </div>
    );
};

export default ModalImportExcel;
