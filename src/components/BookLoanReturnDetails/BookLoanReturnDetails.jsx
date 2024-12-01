import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetailsById } from '../../services/userService';
import { toast } from 'react-toastify';
import './BookLoanReturnDetails.css';

function BookLoanReturnDetails() {
    const { id } = useParams();
    const [userDetails, setUserDetails] = useState(null);
    const [transactionInput, setTransactionInput] = useState(false);
    const [borrowDate, setBorrowDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await getUserDetailsById(id);
                if (response.EC === 0) {
                    setUserDetails(response.DT);
                } else {
                    toast.error(response.EM || 'Không tìm thấy thông tin người dùng.');
                }
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết người dùng:', error);
            }
        };

        fetchUserDetails();
    }, [id]);

    const handleEditDetails = (transaction) => {
        setTransactionInput(true);
        setBorrowDate(new Date(transaction.borrow_date).toISOString().split('T')[0]);
        setReturnDate(new Date(transaction.return_date).toISOString().split('T')[0]);
    };

    const handleDateChangeBrrowDate = (e) => {
        setBorrowDate(e.target.value);
    };
    const handleDateChangeReturnDate = (e) => {
        setReturnDate(e.target.value);
    };

    return (
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
                    {userDetails?.Transactions?.map((transaction) => (
                        <table className="w-full mb-4" key={transaction.id}>
                            <thead className="bg-[#020617] text-white header-content-book">
                                <tr>
                                    <th className="px-4 py-2 text-left border-spacing-3 text-nowrap">Thông tin</th>
                                    <th className="px-4 py-2 text-left border-spacing-3">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="body-content-book">
                                <tr>
                                    <td className="px-4 py-2 font-medium">Tên sách:</td>
                                    <td className="px-4 py-2 text-ellipsis">{transaction.Book?.title}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-medium">Ngày mượn:</td>
                                    {transactionInput ? (
                                        <td className="px-4 py-2">
                                            <input
                                                type="date"
                                                value={borrowDate}
                                                onChange={handleDateChangeBrrowDate}
                                            />
                                        </td>
                                    ) : (
                                        <td className="px-4 py-2">
                                            {new Date(transaction.borrow_date).toLocaleDateString()}
                                        </td>
                                    )}
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-medium">Ngày trả:</td>
                                    <td className="px-4 py-2">
                                        {transactionInput ? (
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    value={returnDate}
                                                    onChange={handleDateChangeReturnDate}
                                                />
                                            </td>
                                        ) : (
                                            <td className="px-4 py-2">
                                                {new Date(transaction.return_date).toLocaleDateString()}
                                            </td>
                                        )}
                                    </td>
                                </tr>
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
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg"
                    onClick={() => handleEditDetails(userDetails.Transactions[0])} // Giả sử chỉ chỉnh sửa 1 giao dịch đầu tiên
                >
                    Chỉnh sửa
                </button>
                <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">Xóa</button>
            </div>
        </div>
    );
}

export default BookLoanReturnDetails;
