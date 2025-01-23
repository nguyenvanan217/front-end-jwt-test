import React, { useState, useEffect } from 'react';
import { getAllInforUser, markViolationAsResolved } from '../../services/userService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function BookBorrowingHistory() {
    const [borrowingData, setBorrowingData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

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
                const transactionMap = new Map();

                response.DT.forEach((user) => {
                    if (user?.Transactions?.id && user.Transactions.status && user.Transactions.Book) {
                        const key = user.Transactions.id;
                        if (!transactionMap.has(key)) {
                            transactionMap.set(key, user);
                        }
                    }
                });

                const uniqueTransactions = Array.from(transactionMap.values());

                console.log('Unique Transactions:', uniqueTransactions);
                setBorrowingData(uniqueTransactions);
                setFilteredData(uniqueTransactions);
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

        if (searchTerm.trim()) {
            const searchTermLower = searchTerm.trim().toLowerCase();

            filtered = filtered.filter((user) => {
                if (!user?.username) return false;
                const username = user.username.toLowerCase();
                return username.includes(searchTermLower);
            });
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((user) => user?.Transactions?.status === statusFilter);
        }

        const uniqueTransactions = new Map();
        filtered.forEach((user) => {
            if (user?.Transactions?.id) {
                uniqueTransactions.set(user.Transactions.id, user);
            }
        });

        filtered = Array.from(uniqueTransactions.values());

        filtered.sort((a, b) => {
            const dateA = new Date(a.Transactions.borrow_date);
            const dateB = new Date(b.Transactions.borrow_date);
            return dateB - dateA;
        });

        console.log('Total results:', filtered.length);
        console.log(
            'Filtered Data:',
            filtered.map((user) => ({
                id: user.id,
                username: user.username,
                transactionId: user.Transactions.id,
            })),
        );

        setFilteredData(filtered);
    };

    const handleConfirmReturn = async (transactionId) => {
        try {
            const response = await markViolationAsResolved(transactionId);
            if (response && response.EC === 0) {
                toast.success('Xác nhận trả sách thành công');
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

    const calculateFine = (returnDate) => {
        if (!returnDate) return 0;

        const today = new Date();
        const dueDate = new Date(returnDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays * 10000;
        }
        return 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <>
            <div className="w-[96%] mx-auto mt-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-4">Quản lý mượn trả sách</h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <div className="relative w-full md:w-[96%]">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên sinh viên..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">Tất cả sách</option>
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
                                if (!user?.Transactions?.Book) return null;

                                const transactionKey = `${user.Transactions.id}-${user.Transactions.Book.id}`;

                                const fine =
                                    user.Transactions.status === 'Quá hạn'
                                        ? calculateFine(user.Transactions.return_date)
                                        : 0;

                                return (
                                    <tr key={transactionKey} className="hover:bg-gray-50">
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
                            })}
                        </tbody>
                    </table>

                    {filteredData.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            {searchTerm ? 'Không tìm thấy sinh viên này' : 'Không có dữ liệu'}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default BookBorrowingHistory;
