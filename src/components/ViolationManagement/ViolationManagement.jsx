import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllUsersAndTransactions, markViolationAsResolved } from '../../services/userService';
import { FaSearch } from 'react-icons/fa';

function ViolationManagement() {
    const [violationUsers, setViolationUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchViolationUsers();
    }, []);

    const fetchViolationUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsersAndTransactions();
            if (response.EC === 0) {
                // Lọc những user có transaction quá hạn
                const usersWithViolations = response.DT.filter((user) =>
                    user.Transactions?.some((trans) => trans.status === 'Quá hạn'),
                );
                setViolationUsers(usersWithViolations);
                console.log('check>>> usersWithViolations', usersWithViolations);
            }
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Tính số ngày trễ hạn
    const calculateOverdueDays = (returnDate) => {
        const today = new Date();
        const dueDate = new Date(returnDate);
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Tính tiền phạt (ví dụ: 5000đ/ngày)

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = violationUsers.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        const hasUnresolvedViolations = user.Transactions.some(
            (trans) => trans.status === 'Quá hạn' && !trans.fineStatus,
        );
        return (
            matchesSearch &&
            ((filterStatus === 'pending' && hasUnresolvedViolations) ||
                (filterStatus === 'resolved' && !hasUnresolvedViolations))
        );
    });

    const handleMarkAsResolved = async (transactionId) => {
        try {
            const response = await markViolationAsResolved(transactionId);
            if (response && response.EC === 0) {
                toast.success('Cập nhật trạng thái thành công');
                await fetchViolationUsers();
            } else {
                toast.error(response.EM || 'Cập nhật trạng thái thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    // Sửa lại hàm đếm số sách quá hạn
    const countOverdueBooks = (transactions) => {
        const overdueTransactions = transactions.filter((trans) => {
            return trans.status === 'Quá hạn';
        });

        const overdueCount = overdueTransactions.length;

        return overdueCount;
    };

    // Tính tổng số ngày trễ của tất cả sách quá hạn
    const calculateTotalOverdueDays = (transactions) => {
        const totalDays = transactions
            .filter((trans) => trans.status === 'Quá hạn')
            .reduce((total, trans) => {
                return total + calculateOverdueDays(trans.return_date);
            }, 0);

        return totalDays;
    };

    // Tính tổng tiền phạt

    return (
        <div className="w-[97%] mx-auto mt-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Danh Sách Sinh Viên Vi Phạm Trả Sách Muộn</h1>

            {/* Search and Filter Section */}
            <div className="flex justify-between items-center mb-6 gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chưa nộp phạt</option>
                    <option value="resolved">Đã nộp phạt</option>
                </select>
            </div>

            {/* Violations Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-[#020617] text-white">
                            <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Tên sinh viên</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Số sách quá hạn</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Số ngày trễ (tổng sách)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Tiền phạt (5.000đ/ngày)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">
                                    <div className="flex justify-center items-center space-x-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const overdueBooks = countOverdueBooks(user.Transactions);

                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{user.id}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-red-600">
                                            {overdueBooks} cuốn
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-red-600">ngày</td>
                                        <td className="px-4 py-3 text-sm font-medium text-red-600">đ</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${
                                                    user.Transactions.some(
                                                        (t) => !t.fineStatus && t.status === 'Quá hạn',
                                                    )
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {user.Transactions.some((t) => !t.fineStatus && t.status === 'Quá hạn')
                                                    ? 'Chưa nộp phạt'
                                                    : 'Đã nộp phạt'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/bookloanreturndetails/${user.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Xem Chi tiết
                                                </Link>
                                                {user.Transactions.some(
                                                    (t) => !t.fineStatus && t.status === 'Quá hạn',
                                                ) && (
                                                    <button
                                                        className="text-green-600 hover:text-green-800 font-medium"
                                                        onClick={() => handleMarkAsResolved(user.id)}
                                                    >
                                                        Đã nộp phạt & trả sách
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                    Không tìm thấy vi phạm nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ViolationManagement;
