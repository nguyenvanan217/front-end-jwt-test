import React, { useState, useEffect } from 'react';
import { getAllInforUser, markViolationAsResolved } from '../../services/userService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function BookBorrowingHistory() {
    const [borrowingData, setBorrowingData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        fetchBorrowingData();
    }, []);

    useEffect(() => {
        filterData();
    }, [borrowingData, searchTerm, statusFilter]);

    const fetchBorrowingData = async () => {
        try {
            const response = await getAllInforUser();
            if (response && response.EC === 0) {
                // Lọc ra những user có giao dịch và có status
                const usersWithTransactions = response.DT.filter((user) => user?.Transactions?.status);
                setBorrowingData(usersWithTransactions);
                console.log('usersWithTransactions1', usersWithTransactions);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            toast.error('Không thể lấy dữ liệu mượn sách');
        }
    };

    const filterData = () => {
        let filtered = [...borrowingData];

        if (searchTerm) {
            filtered = filtered.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((user) => user.Transactions.status === statusFilter);
        }

        setFilteredData(filtered);
    };

    const handleConfirmReturn = async (transactionId) => {
        try {
            console.log('hilu2', transactionId);
            const response = await markViolationAsResolved(transactionId);
            if (response && response.EC === 0) {
                toast.success('Xác nhận trả sách thành công');
                // Cập nhật lại dữ liệu
                fetchBorrowingData();
            } else {
                toast.error(response.EM || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận:', error);
            toast.error('Không thể xác nhận trả sách');
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

    // Thêm hàm tính số ngày quá hạn và tiền phạt
    const calculateFine = (returnDate) => {
        if (!returnDate) return 0;

        const today = new Date();
        const dueDate = new Date(returnDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        // Chỉ tính tiền phạt nếu đã quá hạn
        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * 10000; // 10.000đ/ngày
        }
        return 0;
    };

    // Thêm hàm format tiền VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <>
            <div className="w-[97%] mx-auto mt-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-4">Quản lý mượn trả sách</h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên sinh viên..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-full md:w-64">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Đã trả">Đã trả</option>
                            <option value="Chờ trả">Chờ trả</option>
                            <option value="Quá hạn">Quá hạn</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">ID</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Tên sinh viên</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Email</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Tên sách</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Ngày mượn</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Ngày trả</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap w-[120px]">Tiền phạt</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Trạng thái</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Chi tiết</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Xác nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((user) => {
                                if (user?.Transactions?.Book) {
                                    const fine =
                                        user.Transactions.status === 'Quá hạn'
                                            ? calculateFine(user.Transactions.return_date)
                                            : 0;

                                    return (
                                        <tr
                                            key={`${user.id}-${user.Transactions.Book.id}`}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="py-2 px-4 border-b whitespace-nowrap">{user.id}</td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="w-[140px] truncate" title={user.username || ''}>
                                                    {user.username}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="w-[140px] truncate" title={user.email || ''}>
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <div
                                                    className="w-[160px] truncate"
                                                    title={user.Transactions.Book.title || ''}
                                                >
                                                    {user.Transactions.Book.title}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                {formatDate(user.Transactions.borrow_date)}
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                {formatDate(user.Transactions.return_date)}
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap w-[120px]">
                                                {user.Transactions.status === 'Quá hạn' ? (
                                                    <div
                                                        className="w-full truncate text-red-500 font-medium"
                                                        title={formatCurrency(fine)}
                                                    >
                                                        {formatCurrency(fine)}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="w-full truncate text-gray-500"
                                                        title="Không có tiền phạt"
                                                    >
                                                        Không có
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded text-white inline-block
                                                    ${
                                                        user.Transactions.status === 'Quá hạn'
                                                            ? 'bg-red-500'
                                                            : user.Transactions.status === 'Chờ trả'
                                                            ? 'bg-orange-500'
                                                            : 'bg-green-500'
                                                    }`}
                                                >
                                                    {user.Transactions.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                <Link
                                                    to={`/bookloanreturndetails/${user.id}`}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Chi tiết
                                                </Link>
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                {user.Transactions.status === 'Quá hạn' && (
                                                    <button
                                                        onClick={() => handleConfirmReturn(user.Transactions.id)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm whitespace-nowrap"
                                                    >
                                                        Xác nhận đã nộp phạt
                                                    </button>
                                                )}
                                                {user.Transactions.status === 'Chờ trả' && (
                                                    <button
                                                        onClick={() => handleConfirmReturn(user.Transactions.id)}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm whitespace-nowrap"
                                                    >
                                                        Xác nhận đã trả sách
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }
                                return null;
                            })}
                        </tbody>
                    </table>

                    {filteredData.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Không tìm thấy kết quả phù hợp'
                                : 'Không có dữ liệu'}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default BookBorrowingHistory;
