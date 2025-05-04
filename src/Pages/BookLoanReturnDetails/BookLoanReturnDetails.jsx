import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    deleteTransaction,
    getUserDetailsById,
    updateTransactionDateAndStatus,
    markViolationAsResolved,
} from '../../services/userService';
import { toast } from 'react-toastify';
import './BookLoanReturnDetails.css';
import ModalDeleteTransaction from './ModalDeleteTransaction';
import { autoUpdateStatusInDB } from '../../services/bookManagerService';
import { useTransactionCalculations } from '../../hooks/useTransactionCalculations';

function BookLoanReturnDetails() {
    const { id } = useParams();
    const [userDetails, setUserDetails] = useState(null);
    const [buttonUpdate, setButtonUpdate] = useState(false);
    const [deleteBorrowedTable, setDeleteBorrowedTable] = useState(false);
    const [dateInput, setDateInput] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [getTransactionId, setGetTransactionId] = useState('');
    const [dateErrors, setDateErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [needsStatusUpdate, setNeedsStatusUpdate] = useState(false);

    // Sử dụng custom hook cho các tính toán
    const { statusCounts, overdueDaysAndFine, calculateOverdueDays, calculateFine } = useTransactionCalculations(
        userDetails?.Transactions,
    );

    // Memoize format functions
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }, []);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    }, []);

    // Tách logic validate dates
    const validateDates = useCallback((transactions) => {
        const errors = {};
        transactions.forEach((transaction) => {
            if (!transaction.borrow_date || !transaction.return_date) {
                errors[transaction.id] = 'Vui lòng nhập đầy đủ ngày mượn và ngày trả';
                return;
            }

            const borrowDate = new Date(transaction.borrow_date);
            const returnDate = new Date(transaction.return_date);

            if (borrowDate > returnDate) {
                errors[transaction.id] = 'Ngày mượn không thể lớn hơn ngày trả';
            }
        });
        return errors;
    }, []);

    // Tối ưu fetchData với useCallback
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userResponse = await getUserDetailsById(id);

            if (userResponse?.EC === 0 && userResponse?.DT) {
                const validTransactions =
                    userResponse.DT.Transactions?.filter((trans) => trans && trans.Book && !trans.is_deleted) || [];

                setUserDetails({
                    ...userResponse.DT,
                    Transactions: validTransactions,
                });

                // Kiểm tra xem có cần update status không
                const hasOverdueOrPending = validTransactions.some((trans) =>
                    ['Chờ trả', 'Quá hạn'].includes(trans.status),
                );
                setNeedsStatusUpdate(hasOverdueOrPending);
            } else {
                toast.error(userResponse?.EM || 'Không thể tải thông tin người dùng.');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            toast.error('Đã xảy ra lỗi khi tải thông tin.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Update status chỉ khi cần thiết
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (needsStatusUpdate) {
            autoUpdateStatusInDB().then(() => {
                fetchData();
                setNeedsStatusUpdate(false);
            });
        }
    }, [needsStatusUpdate, fetchData]);

    // Tối ưu các handlers với useCallback
    const handleDateChange = useCallback((event, transactionId, dateType) => {
        setUserDetails((prev) => ({
            ...prev,
            Transactions: prev.Transactions.map((transaction) =>
                transaction.id === transactionId ? { ...transaction, [dateType]: event.target.value } : transaction,
            ),
        }));
    }, []);

    const handleSaveChanges = useCallback(async () => {
        try {
            const errors = validateDates(userDetails.Transactions);
            if (Object.keys(errors).length > 0) {
                setDateErrors(errors);
                toast.error('Vui lòng kiểm tra lại thông tin ngày mượn/trả');
                return;
            }

            setDateErrors({});
            const transactions = userDetails.Transactions.map(({ id, status, borrow_date, return_date }) => ({
                id,
                status,
                borrow_date,
                return_date,
            }));

            const response = await updateTransactionDateAndStatus(transactions);

            if (response?.EC === 0) {
                toast.success(response.EM);
                setDateInput(false);
                setButtonUpdate(false);
                setNeedsStatusUpdate(true);
            } else {
                toast.error(response?.EM || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            toast.error('Đã xảy ra lỗi khi cập nhật.');
        }
    }, [userDetails, validateDates]);

    // Tối ưu các handlers khác
    const handleConfirmReturn = useCallback(async (transactionId) => {
        try {
            const response = await markViolationAsResolved(transactionId);
            if (response?.EC === 0) {
                toast.success('Xác nhận trạng thái thành công');
                setNeedsStatusUpdate(true);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận:', error);
            toast.error('Không thể xác nhận trạng thái');
        }
    }, []);

    const handleConfirmDeleteTransaction = useCallback(async () => {
        try {
            const response = await deleteTransaction(getTransactionId);
            if (response?.EC === 0) {
                toast.success(response.EM);
                setUserDetails((prev) => ({
                    ...prev,
                    Transactions: prev.Transactions.filter((transaction) => transaction.id !== getTransactionId),
                }));
            } else {
                toast.error(response.EM || 'Xóa giao dịch thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi xóa transaction:', error);
        } finally {
            setIsOpenModal(false);
        }
    }, [getTransactionId]);

    const handleEditDetails = () => {
        setDateInput(true);
        setButtonUpdate(true);
    };

    const handleCancelEdit = () => {
        setDateInput(false);
        setButtonUpdate(false);
        fetchData();
    };

    const handleCancelDelete = () => {
        setDeleteBorrowedTable(false);
    };
    const handleDeleteBorrowedBookTable = () => {
        setDeleteBorrowedTable(true);
    };

    const handleOpenDeleteModal = (transactionId) => {
        setIsOpenModal(true);
        setGetTransactionId(transactionId);
    };

    const TEST_DATE = '2025-05-07'; // Format YYYY-MM-DD

    const formatCurrentDate = () => {
        const testDate = new Date(TEST_DATE);
        return formatDate(testDate);
    };

    return (
        <>
            {isOpenModal && (
                <ModalDeleteTransaction
                    isOpen={isOpenModal}
                    setIsOpenModal={setIsOpenModal}
                    getTransactionId={getTransactionId}
                    handleConfirmDeleteTransaction={handleConfirmDeleteTransaction}
                />
            )}
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">Chi Tiết Mượn Trả</h2>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
                    </div>
                ) : (
                    <div className="flex justify-between gap-6">
                        {/* Thông tin người dùng */}
                        <div className="w-3/6">
                            <h3 className="font-semibold text-lg text-blue-600 mb-2">Thông tin người dùng:</h3>
                            <table className="min-w-full table-auto border-collapse">
                                <thead className="bg-blue-500 text-white">
                                    <tr>
                                        <th className="px-4 py-2 table-header">Thông tin</th>
                                        <th className="px-4 py-2 table-header">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-2 font-medium text-nowrap">ID người dùng:</td>
                                        <td className="px-4 py-2">{userDetails?.id}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Email:</td>
                                        <td className="px-4 py-2 text-ellipsis">{userDetails?.email}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Tên người dùng:</td>
                                        <td className="px-4 py-2 text-ellipsis">{userDetails?.username}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Nhóm:</td>
                                        <td className="px-4 py-2">{userDetails?.Group?.name}</td>
                                    </tr>
                                    {/* Thêm thống kê số lượng sách */}
                                    <tr className="border-t">
                                        <td colSpan="2" className="px-4 py-2 font-medium text-blue-600">
                                            Thống kê mượn sách:
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Đã trả:</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                {statusCounts.returned} sách
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Chờ trả:</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                {statusCounts.pending} sách
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Quá hạn:</td>
                                        <td className="px-4 py-2">
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                                {statusCounts.overdue} sách
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium">Ngày hiện tại:</td>
                                        <td className="px-4 py-2 text-blue-600 font-medium">{formatCurrentDate()}</td>
                                    </tr>
                                    {statusCounts.overdue > 0 && (
                                        <>
                                            <tr>
                                                <td className="px-4 py-2 font-medium">Tổng số ngày quá hạn:</td>
                                                <td className="px-4 py-2">
                                                    <span className="text-red-500 font-bold px-2 py-1 rounded">
                                                        {overdueDaysAndFine.totalDays} ngày
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 font-medium">Tiền phạt:</td>
                                                <td className="px-4 py-2">
                                                    <span className="text-red-500 font-bold px-2 py-1 rounded">
                                                        {formatCurrency(overdueDaysAndFine.totalFine)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Thông tin sách mượn */}
                        <div className="w-3/6">
                            <h3 className="font-semibold text-lg text-green-600 mb-2">Thông tin sách mượn:</h3>
                            {userDetails ? (
                                userDetails.Transactions && userDetails.Transactions.length > 0 ? (
                                    userDetails.Transactions.map((transaction) => (
                                        <table className="w-full mb-4" key={transaction.id}>
                                            <thead className="bg-[#020617] text-white header-content-book relative z-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left border-spacing-3 text-nowrap">
                                                        Thông tin
                                                    </th>
                                                    <th className="px-4 py-2 text-left border-spacing-3">Chi tiết</th>
                                                </tr>
                                                {deleteBorrowedTable && (
                                                    <button
                                                        className="absolute top-[15%] left-[93%] w-10 h-7 bg-red-600"
                                                        onClick={() => handleOpenDeleteModal(transaction.id)}
                                                    >
                                                        X
                                                    </button>
                                                )}
                                            </thead>
                                            <tbody className="body-content-book">
                                                <tr>
                                                    <td className="px-4 py-2 font-medium">Id giao dịch:</td>
                                                    <td className="px-4 py-2 text-ellipsis">{transaction.id}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-medium">Tên sách:</td>
                                                    <td className="px-4 py-2 text-ellipsis">
                                                        {transaction.Book?.title}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-medium">Ngày mượn:</td>
                                                    {dateInput ? (
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="date"
                                                                value={transaction.borrow_date?.split('T')[0]}
                                                                onChange={(e) =>
                                                                    handleDateChange(e, transaction.id, 'borrow_date')
                                                                }
                                                                className={`border ${
                                                                    dateErrors[transaction.id]
                                                                        ? 'border-red-500'
                                                                        : 'border-gray-300'
                                                                } rounded px-2 py-1 outline-none`}
                                                            />
                                                        </td>
                                                    ) : (
                                                        <td className="px-4 py-2">
                                                            {formatDate(transaction.borrow_date)}
                                                        </td>
                                                    )}
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-medium">Ngày trả:</td>
                                                    {dateInput ? (
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="date"
                                                                value={transaction.return_date?.split('T')[0]}
                                                                onChange={(e) =>
                                                                    handleDateChange(e, transaction.id, 'return_date')
                                                                }
                                                                className={`border ${
                                                                    dateErrors[transaction.id]
                                                                        ? 'border-red-500'
                                                                        : 'border-gray-300'
                                                                } rounded px-2 py-1 outline-none`}
                                                            />
                                                        </td>
                                                    ) : (
                                                        <td className="px-4 py-2">
                                                            {formatDate(transaction.return_date)}
                                                        </td>
                                                    )}
                                                </tr>
                                                {transaction.status === 'Quá hạn' && (
                                                    <>
                                                        <tr>
                                                            <td className="px-4 py-2 font-medium">Số ngày quá hạn:</td>
                                                            <td className="px-4 py-2">
                                                                <span className="text-red-500 font-medium">
                                                                    {calculateOverdueDays(transaction.return_date)} ngày
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 font-medium">Tiền phạt:</td>
                                                            <td className="px-4 py-2">
                                                                <span className="text-red-500 font-medium">
                                                                    {formatCurrency(
                                                                        calculateFine(transaction.return_date),
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
                                                {dateErrors[transaction.id] && (
                                                    <tr>
                                                        <td colSpan="2" className="px-4 py-2">
                                                            <span className="text-red-500 text-sm">
                                                                {dateErrors[transaction.id]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="px-4 py-2 font-medium">Trạng thái:</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-4">
                                                            <span
                                                                className={`px-2 py-1 rounded ${
                                                                    transaction.status === 'Quá hạn'
                                                                        ? 'bg-red-500 text-white'
                                                                        : transaction.status === 'Chờ trả'
                                                                        ? 'bg-orange-500 text-white'
                                                                        : transaction.status === 'Đã trả'
                                                                        ? 'bg-green-500 text-white'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {transaction.status}
                                                            </span>
                                                            {(transaction.status === 'Quá hạn' ||
                                                                transaction.status === 'Chờ trả') && (
                                                                <button
                                                                    onClick={() => handleConfirmReturn(transaction.id)}
                                                                    className={`text-white font-bold py-1 px-3 rounded text-sm ${
                                                                        transaction.status === 'Quá hạn'
                                                                            ? 'bg-blue-500 hover:bg-blue-700'
                                                                            : 'bg-green-500 hover:bg-green-700'
                                                                    }`}
                                                                >
                                                                    {transaction.status === 'Quá hạn'
                                                                        ? 'Xác nhận đã nộp phạt'
                                                                        : 'Xác nhận đã trả sách'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    ))
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="text-yellow-500 font-medium mb-2">
                                            {userDetails.borrowedBooksCount > 0
                                                ? 'Đang tải thông tin giao dịch...'
                                                : 'Sinh viên này chưa có giao dịch mượn sách nào.'}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Nếu bạn cho rằng đây là lỗi, vui lòng kiểm tra lại trong vài giây.
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-gray-500">Đang tải thông tin...</div>
                            )}
                        </div>
                    </div>
                )}

                {userDetails?.Transactions?.length > 0 && (
                    <div className="flex justify-end gap-4 mt-6">
                        {buttonUpdate && (
                            <button
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg"
                                onClick={handleSaveChanges}
                            >
                                Lưu
                            </button>
                        )}
                        <button
                            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg"
                            onClick={buttonUpdate ? handleCancelEdit : () => handleEditDetails()}
                        >
                            {buttonUpdate ? 'Hủy' : 'Chỉnh sửa'}
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg"
                            onClick={deleteBorrowedTable ? handleCancelDelete : () => handleDeleteBorrowedBookTable()}
                        >
                            {deleteBorrowedTable ? 'Hủy' : 'Xóa'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
export default BookLoanReturnDetails;
