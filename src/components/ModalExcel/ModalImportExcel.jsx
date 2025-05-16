import React, { useEffect } from 'react';

const ModalImportExcel = ({ isOpen, onClose, importResult }) => {
    useEffect(() => {
        console.log('Check import result', importResult);
    }, []);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
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
                            // Validation Error hoặc Server Error
                            <div className="p-4 bg-red-100 rounded">
                                <p className="font-bold text-red-700 mb-4">
                                    {importResult.EM}
                                    {importResult.DT?.totalRows && (
                                        <span className="block text-sm mt-2">
                                            Tổng số dòng: {importResult.DT.totalRows} | Hợp lệ:{' '}
                                            {importResult.DT.validRows} | Lỗi: {importResult.DT.errorRows}
                                        </span>
                                    )}
                                </p>
                                {importResult.DT?.details?.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold mb-2">Chi tiết lỗi:</p>
                                        <ul className="space-y-2">
                                            {importResult.DT.details.map((detail, index) => (
                                                <li key={index} className="text-red-600">
                                                    • Dòng {detail.row}: {detail.title}
                                                    {detail.errors.map((err, i) => (
                                                        <p key={i} className="ml-4 text-sm">
                                                            - {err}
                                                        </p>
                                                    ))}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
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
