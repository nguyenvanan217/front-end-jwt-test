import React, { useContext, useEffect, useState } from 'react';
import avatar from '../../assets/img/avatar.jpg';
import AuthContext from '../../components/Context/auth.context';
import { getUserDetailsById } from '../../services/userService';
import { toast } from 'react-toastify';
import ModalPayment from '../../components/BankQR/ModalPayment';

function AccountInformation() {
    const { auth } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);
    const [isOpenModalPayMent, setIsOpenModalPayMent] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [auth.user]);

    const fetchUserDetails = async () => {
        try {
            if (auth.user?.id) {
                const response = await getUserDetailsById(auth.user.id);
                if (response && response.EC === 0) {
                    setUserDetails(response.DT);
                } else {
                    toast.error(response.EM);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatCurrentDate = () => {
        const today = new Date();
        return formatDate(today);
    };

    const calculateDays = (returnDate) => {
        if (!returnDate) return 0;

        const end = new Date(returnDate);
        const today = new Date();

        // Reset time về 00:00:00
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Chỉ tính ngày quá hạn nếu ngày hiện tại > ngày trả
        if (today > end) {
            const diffTime = today - end;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        return 0;
    };

    const calculateOverdueDays = (returnDate) => {
        return calculateDays(returnDate);
    };

    const calculateFine = (returnDate) => {
        const overdueDays = calculateOverdueDays(returnDate);
        const fine = overdueDays * 10000;
        return fine;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Tính tổng số ngày quá hạn và tiền phạt
    const calculateTotalOverdueDaysAndFine = () => {
        if (!userDetails?.Transactions) return { totalDays: 0, totalFine: 0 };

        return userDetails.Transactions.reduce(
            (acc, transaction) => {
                if (transaction.status === 'Quá hạn') {
                    const overdueDays = calculateOverdueDays(transaction.return_date);
                    const fine = calculateFine(transaction.return_date);
                    acc.totalDays += overdueDays;
                    acc.totalFine += fine;
                }
                return acc;
            },
            { totalDays: 0, totalFine: 0 },
        );
    };

    // Tính toán số lượng sách theo trạng thái
    const calculateStatusCounts = () => {
        if (!userDetails?.Transactions) return { returned: 0, pending: 0, overdue: 0 };

        return userDetails.Transactions.reduce(
            (acc, transaction) => {
                switch (transaction.status) {
                    case 'Đã trả':
                        acc.returned++;
                        break;
                    case 'Chờ trả':
                        acc.pending++;
                        break;
                    case 'Quá hạn':
                        acc.overdue++;
                        break;
                    default:
                        break;
                }
                return acc;
            },
            { returned: 0, pending: 0, overdue: 0 },
        );
    };

    const getOverdueBooks = () => {
        if (!userDetails?.Transactions) return [];
        return userDetails.Transactions.filter((trans) => trans.status === 'Quá hạn').map((trans) => ({
            bookId: trans.bookId,
            Book: trans.Book,
        }));
    };

    const handlePaymentmodalOpen = () => {
        setIsOpenModalPayMent(true);
    };

    return (
        <>
            <ModalPayment
                isOpen={isOpenModalPayMent}
                setIsOpenModal={setIsOpenModalPayMent}
                totalPrice={formatCurrency(calculateTotalOverdueDaysAndFine().totalFine)}
                userDetails={userDetails}
                overdueBooks={getOverdueBooks()}
            />
            <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-600 mb-4 sm:mb-6 md:mb-10">
                    Thông Tin Tài Khoản Và Lịch Sử Mượn Trả
                </h2>

                <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6">
                    {/* Thông tin cá nhân */}
                    <div className="w-full md:w-2/5">
                        <div className="text-center mb-4 sm:mb-5 md:mb-6">
                            <img
                                src={avatar}
                                alt="Avatar"
                                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full mx-auto mb-3 sm:mb-4 border-4 border-blue-500"
                            />
                            <h3 className="text-lg sm:text-xl font-semibold">Tên Sinh Viên: {auth.user?.name}</h3>
                            <p className="text-sm sm:text-base text-gray-600">{auth.user?.email}</p>
                        </div>

                        <h4 className="font-semibold text-xl sm:text-2xl text-green-600 mb-3 sm:mb-4">
                            Thống kê mượn sách:
                        </h4>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Đã trả:</span>
                                    <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full">
                                        {calculateStatusCounts().returned} sách
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Chờ trả:</span>
                                    <span className="bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full">
                                        {calculateStatusCounts().pending} sách
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Quá hạn:</span>
                                    <span className="bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full">
                                        {calculateStatusCounts().overdue} sách
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span>Ngày hiện tại:</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full">
                                        {formatCurrentDate()}
                                    </span>
                                </div>
                                {calculateStatusCounts().overdue > 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                            <span>Tổng số ngày quá hạn:</span>
                                            <span className="text-red-500 font-bold px-2 sm:px-3 py-1 rounded-full">
                                                {calculateTotalOverdueDaysAndFine().totalDays} ngày
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                            <span>Tổng số Tiền phạt:</span>
                                            <span className="text-red-500 font-bold px-2 sm:px-3 py-1 rounded-full">
                                                {formatCurrency(calculateTotalOverdueDaysAndFine().totalFine)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                            <span>Thanh toán:</span>
                                            <button
                                                onClick={handlePaymentmodalOpen}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
                                            >
                                                Thanh toán tại đây
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết mượn trả */}
                    <div className="w-full md:w-3/5">
                        <h3 className="font-semibold text-xl sm:text-2xl text-green-600 mb-3 sm:mb-4">
                            Lịch sử mượn trả sách của bạn:
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                            {userDetails?.Transactions?.length > 0 ? (
                                userDetails.Transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                            <div>
                                                <p className="text-gray-600 text-sm">ID giao dịch:</p>
                                                <p className="font-medium text-sm sm:text-base">{transaction.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Tên sách:</p>
                                                <p className="font-medium text-sm sm:text-base">
                                                    {transaction.Book?.title}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Ngày mượn:</p>
                                                <p className="font-medium text-sm sm:text-base">
                                                    {formatDate(transaction.borrow_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-sm">Ngày trả:</p>
                                                <p className="font-medium text-sm sm:text-base">
                                                    {formatDate(transaction.return_date)}
                                                </p>
                                            </div>
                                            {transaction.status === 'Quá hạn' && (
                                                <div className="col-span-1 sm:col-span-2">
                                                    <p className="text-gray-600 text-sm">Số ngày quá hạn:</p>
                                                    <p className="font-medium text-red-600 text-sm sm:text-base">
                                                        {calculateOverdueDays(transaction.return_date)} ngày
                                                        <span className="ml-2">
                                                            ({formatCurrency(calculateFine(transaction.return_date))})
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                            <div className="col-span-1 sm:col-span-2">
                                                <p className="text-gray-600 text-sm">Trạng thái:</p>
                                                <span
                                                    className={`
                                                        inline-block 
                                                        px-2 sm:px-3 
                                                        py-0.5 sm:py-1 
                                                        rounded-full 
                                                        text-xs sm:text-sm 
                                                        font-medium 
                                                        ${
                                                            transaction.status === 'Quá hạn'
                                                                ? 'bg-red-100 text-red-800'
                                                                : transaction.status === 'Chờ trả'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }
                                                    `}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-3 sm:py-4 text-sm sm:text-base">
                                    Bạn chưa có lịch sử mượn sách nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AccountInformation;
