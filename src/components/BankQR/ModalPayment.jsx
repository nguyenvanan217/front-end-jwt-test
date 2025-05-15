import React from 'react';
import { IoMdClose } from 'react-icons/io';

function ModalPayment({ isOpen, setIsOpenModal, totalPrice, userDetails, overdueBooks }) {
    const handleClose = () => {
        setIsOpenModal(false);
    };

    const amountOnly = totalPrice.replace(/[^\d.,]/g, '').trim();

    const formatTransferContent = () => {
        if (!userDetails || !overdueBooks || !Array.isArray(overdueBooks)) return '';

        // Lấy mã sinh viên từ email
        const studentId = userDetails.email.split('@')[0];

        // Gom nhóm sách theo bookId và đếm số lượng
        const bookGroups = {};
        overdueBooks.forEach((item) => {
            if (!item || !item.Book) return;
            const bookId = item.bookId;
            if (!bookGroups[bookId]) {
                bookGroups[bookId] = {
                    count: 1,
                    title: item.Book.title,
                };
            } else {
                bookGroups[bookId].count++;
            }
        });

        // Tạo tên viết tắt từ tên sách
        const getAbbreviation = (title) => {
            return title
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase())
                .join('');
        };

        // Format: HUSC:[maSV]_[[(id)tenviettatsach]_[(id)tenviettatsach-xsoluong]
        const bookList = Object.entries(bookGroups)
            .map(([bookId, info]) => {
                const abbr = getAbbreviation(info.title);
                return info.count > 1 ? `[(${bookId})${abbr}-x${info.count}]` : `[(${bookId})${abbr}]`;
            })
            .join('_');

        return bookList ? `HUSC:${studentId}_${bookList}` : `HUSC:${studentId}`;
    };

    const transferContent = formatTransferContent();
    const QR = `https://img.vietqr.io/image/${process.env.REACT_APP_BANK_ID}-${process.env.REACT_APP_ACCOUNT_NO}-qr_only.png?amount=${amountOnly}&addInfo=${transferContent}&accountName=NGUYEN%20VAN%20A`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-50 pointer-events-auto" onClick={handleClose} />

            {/* Modal content */}
            <div className="relative bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[600px] md:w-[800px] max-h-[90vh] overflow-y-auto z-[9999]">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    <IoMdClose size={20} className="sm:w-6 sm:h-6" />
                </button>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Left section - QR Code */}
                    <div className="flex-1">
                        {/* Modal header */}
                        <div className="text-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Thanh toán QR</h2>
                            <div className="text-gray-500 mt-2 text-sm sm:text-base">
                                Nội dung chuyển khoản: <br />
                                <span className="text-red-500 font-bold break-all">
                                    {transferContent} <br /> Số tiền: {amountOnly.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                            <div className="border-2 border-gray-200 p-2 sm:p-4 rounded-lg">
                                <img src={QR} alt="QR Payment" className="w-48 h-48 sm:w-64 sm:h-64 object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Right section - Information and Instructions */}
                    <div className="flex-1 flex flex-col justify-between mt-4 md:mt-0">
                        {/* Bank Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Thông tin chuyển khoản</h3>
                            <div className="space-y-2 text-sm sm:text-base text-gray-600">
                                <p className="flex justify-between">
                                    <span>Ngân hàng:</span>
                                    <span className="font-medium">{process.env.REACT_APP_BANK_ID}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Số tài khoản:</span>
                                    <span className="font-medium">{process.env.REACT_APP_ACCOUNT_NO}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Chủ tài khoản:</span>
                                    <span className="font-medium">NGUYEN VAN AN</span>
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                                Hướng dẫn thanh toán nộp phạt:
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-600">
                                <li>Mở ứng dụng ngân hàng hoặc ví điện tử của bạn</li>
                                <li>Quét mã QR bên cạnh</li>
                                <li>Kiểm tra thông tin và số tiền thanh toán</li>
                                <li>Xác nhận thanh toán</li>
                                <li>Nhắn tin cho quản lý thư viện để xác nhận thanh toán</li>
                                <li>Kiểm tra thông báo Email</li>
                            </ol>
                        </div>

                        {/* Note */}
                        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 italic">
                            Lưu ý: Vui lòng giữ lại biên lai thanh toán cho đến khi hoàn tất xác nhận
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalPayment;
