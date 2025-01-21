import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deleteTransaction, getUserDetailsById, updateTransactionDateAndStatus } from '../../services/userService';
import { toast } from 'react-toastify';
import './BookLoanReturnDetails.css';
import ModalDeleteTransaction from './ModalDeleteTransaction';
import { autoUpdateStatusInDB } from '../../services/bookManagerService';

function BookLoanReturnDetails() {
    const { id } = useParams();
    const [userDetails, setUserDetails] = useState([]);
    const [buttonUpdate, setButtonUpdate] = useState(false);
    const [deleteBorrowedTable, setDeleteBorrowedTable] = useState(false);
    const [dateInput, setDateInput] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [getTransactionId, setGetTransactionId] = useState('');
    const [dateErrors, setDateErrors] = useState({});

    useEffect(() => {
        fetchUserDetails();
        autoUpdateStatus();
    }, [id]);
    const autoUpdateStatus = async () => {
        try {
            const response = await autoUpdateStatusInDB();
            console.log('response check cú', response);
            if (response && response.DT.hasChanges === true) {
                toast.success(response.EM);
                await fetchUserDetails();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            toast.error('Có lỗi xảy ra khi kiểm tra trạng thái giao dịch');
        }
    };

    const fetchUserDetails = async () => {
        try {
            const response = await getUserDetailsById(id);
            console.log('response', response);
            if (response.EC === 0) {
                setUserDetails(response.DT);
            } else {
                toast.error(response.EM || 'Không tìm thấy thông tin mượn của người dùng.');
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết mượn sách của người dùng:', error);
        }
    };

    const handleEditDetails = () => {
        setDateInput(true);
        setButtonUpdate(true);
    };

    const handleCancelEdit = () => {
        setDateInput(false);
        setButtonUpdate(false);
        fetchUserDetails();
    };

    const handleCancelDelete = () => {
        setDeleteBorrowedTable(false);
    };
    const handleDeleteBorrowedBookTable = () => {
        setDeleteBorrowedTable(true);
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    // xóa transaction
    const handleOpenDeleteModal = (transactionId) => {
        setIsOpenModal(true);
        setGetTransactionId(transactionId);
    };
    const handleConfirmDeleteTransaction = async () => {
        try {
            const response = await deleteTransaction(getTransactionId);
            if (response && response.EC === 0) {
                toast.success(response.EM);
                const updatedTransactions = userDetails.Transactions.filter(
                    (transaction) => transaction.id !== getTransactionId,
                );
                setUserDetails((prev) => ({ ...prev, Transactions: updatedTransactions }));
            } else {
                toast.error(response.EM || 'Xóa giao dịch thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi xóa transaction:', error);
        } finally {
            setIsOpenModal(false);
        }
    };
    const handleDateChange = (event, transactionId, dateType) => {
        const updatedTransactions = userDetails.Transactions.map((transaction) => {
            if (transaction.id === transactionId) {
                return { ...transaction, [dateType]: event.target.value };
            }
            return transaction;
        });
        setUserDetails((prev) => ({ ...prev, Transactions: updatedTransactions }));
        console.log('updatedTransactions', userDetails.Transactions);
    };
    const handleSaveChanges = async () => {
        try {
            const errors = {};
            let hasError = false;

            // Validate dates trước khi gửi request
            userDetails.Transactions.forEach((transaction) => {
                // Kiểm tra xem có trường nào bị trống không
                if (!transaction.borrow_date || !transaction.return_date) {
                    errors[transaction.id] = 'Vui lòng nhập đầy đủ ngày mượn và ngày trả';
                    hasError = true;
                    return;
                }

                // Chuyển đổi string date thành Date object để so sánh
                const borrowDate = new Date(transaction.borrow_date);
                const returnDate = new Date(transaction.return_date);

                // Kiểm tra ngày mượn có lớn hơn ngày trả không
                if (borrowDate > returnDate) {
                    errors[transaction.id] = 'Ngày mượn không thể lớn hơn ngày trả';
                    hasError = true;
                }
            });

            // Nếu có lỗi, hiển thị thông báo và dừng việc gửi request
            if (hasError) {
                setDateErrors(errors);
                toast.error('Vui lòng kiểm tra lại thông tin ngày mượn/trả');
                return;
            }

            // Clear errors nếu không có lỗi
            setDateErrors({});

            const transactions = userDetails.Transactions.map((transaction) => ({
                id: transaction.id,
                status: transaction.status,
                borrow_date: transaction.borrow_date,
                return_date: transaction.return_date,
            }));

            const response = await updateTransactionDateAndStatus(transactions);

            if (response && response.EC === 0) {
                toast.success(response.EM);
                setDateInput(false);
                setButtonUpdate(false);
                await autoUpdateStatus();
                await fetchUserDetails();
            } else if (response && response.EC === 2) {
                toast.warning(response.EM);
            } else {
                toast.error(response.EM || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        }
    };
    return (
        <>
            {isOpenModal && (
                <ModalDeleteTransaction
                    setIsOpenModal={setIsOpenModal}
                    getTransactionId={getTransactionId}
                    handleConfirmDeleteTransaction={handleConfirmDeleteTransaction}
                />
            )}
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-center text-blue-500 mb-4">Chi Tiết Mượn Trả</h2>

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
                            </tbody>
                        </table>
                    </div>

                    {/* Thông tin sách mượn */}
                    <div className="w-3/6">
                        <h3 className="font-semibold text-lg text-green-600 mb-2">Thông tin sách mượn:</h3>
                        {userDetails?.Transactions?.length > 0 ? (
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
                                            <td className="px-4 py-2 text-ellipsis">{transaction.Book?.title}</td>
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
                                                <td className="px-4 py-2">{formatDate(transaction.borrow_date)}</td>
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
                                                <td className="px-4 py-2">{formatDate(transaction.return_date)}</td>
                                            )}
                                        </tr>
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
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            ))
                        ) : (
                            <div className="text-center text-red-500">
                                Sinh viên này chưa mượn sách / hoặc danh sách giao dịch đã bị xóa bởi Quản Lý
                            </div>
                        )}
                    </div>
                </div>

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
