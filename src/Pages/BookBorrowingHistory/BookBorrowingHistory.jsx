import React, { useState, useEffect } from 'react';
import { getAllInforUser, markViolationAsResolved } from '../../services/userService.js';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Pagination from '../../components/Paginate/ReactPaginate.jsx';
import styles from '../UserManagement/UserManagement.module.css';
import { autoUpdateStatusInDB } from '../../services/bookManagerService';
function BookBorrowingHistory() {
    const [borrowingData, setBorrowingData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit] = useState(8);
    const [totalPage, setTotalPage] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            setIsSearching(true);
            const timeoutId = setTimeout(() => {
                setCurrentPage(1);
                fetchBorrowingData();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setIsSearching(false);
            fetchBorrowingData();
        }
    }, [searchTerm, currentPage, currentLimit]);

    useEffect(() => {
        const init = async () => {
            await autoUpdateStatus();
            await fetchBorrowingData();
        };
        init();
    }, []);

    const autoUpdateStatus = async () => {
        try {
            const response = await autoUpdateStatusInDB();
            console.log('Response from autoUpdateStatus:', response);

            if (response && response.EC === 0) {
                if (response.DT && response.DT.hasChanges) {
                    toast.success(response.EM);
                    // Fetch lại dữ liệu ngay lập tức sau khi có thay đổi
                    await fetchBorrowingData();
                }
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
        }
    };

    const fetchBorrowingData = async () => {
        try {
            let response;
            if (searchTerm.trim()) {
                response = await getAllInforUser(null, null, searchTerm);
            } else {
                response = await getAllInforUser(currentPage, currentLimit, '');
            }

            if (response && response.EC === 0) {
                if (response.DT && (response.DT.users || response.DT)) {
                    const users = searchTerm.trim() ? response.DT : response.DT.users;
                    const validUsers = users.filter(
                        (user) =>
                            user?.Transactions && Object.keys(user.Transactions).length > 0 && user.Transactions?.Book,
                    );

                    const filteredByStatus =
                        statusFilter === 'all'
                            ? validUsers
                            : validUsers.filter((user) => user.Transactions.status === statusFilter);

                    setBorrowingData(filteredByStatus);
                    setFilteredData(filteredByStatus);
                    setTotalPage(searchTerm.trim() ? 0 : response.DT.totalPages);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            toast.error('Không thể lấy dữ liệu mượn sách');
        } finally {
            setIsSearching(false);
            setHasSearched(true);
        }
    };

    const handleConfirmReturn = async (transactionId) => {
        try {
            const response = await markViolationAsResolved(transactionId);
            if (response && response.EC === 0) {
                toast.success('Xác nhận trả sách thành công');
                fetchBorrowingData();
            } else {
                toast.error(response.EM);
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

    const calculateDays = (returnDate) => {
        if (!returnDate) return 0;

        const end = new Date(returnDate);
        const today = new Date(TEST_DATE); // Sử dụng TEST_DATE thay vì new Date()

        // Reset time về 00:00:00
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Chỉ tính ngày quá hạn nếu ngày hiện tại > ngày trả
        if (today > end) {
            const diffTime = today - end;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            console.log('Return date:', end.toLocaleDateString());
            console.log('Today:', today.toLocaleDateString());
            console.log('Days overdue:', diffDays);

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
        console.log('Fine amount:', fine);
        return fine;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Thêm biến TEST_DATE để dễ dàng thay đổi ngày test
    const TEST_DATE = '2025-05-07'; // Format YYYY-MM-DD

    const formatCurrentDate = () => {
        // Sử dụng ngày test thay vì ngày hiện tại
        const testDate = new Date(TEST_DATE);
        return formatDate(testDate);
    };

    const handlePageClick = (event) => {
        const newPage = event.selected + 1;
        setCurrentPage(newPage);
    };

    const handleStatusFilterChange = (e) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        setCurrentPage(1);
        const filteredByStatus =
            newStatus === 'all'
                ? borrowingData
                : borrowingData.filter((user) => user.Transactions.status === newStatus);
        setFilteredData(filteredByStatus);
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
                            onChange={handleStatusFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">Tất cả thông tin</option>
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
                                {/* <th className="py-3 px-4 text-left border-b">ID</th> */}
                                <th className="py-3 px-4 text-left border-b">Tên sinh viên</th>
                                <th className="py-3 px-4 text-left border-b">Email</th>
                                <th className="py-3 px-4 text-left border-b">Tên sách</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Ngày mượn</th>
                                <th className="py-3 px-4 text-left border-b">Ngày trả</th>
                                <th className="py-3 px-4 text-left border-b whitespace-nowrap">Ngày hiện tại</th>
                                <th className="py-3 px-4 text-left border-b">Số ngày quá hạn</th>
                                <th className="py-3 px-4 text-left border-b">Tiền phạt</th>
                                <th className="py-3 px-4 text-left border-b">Trạng thái</th>
                                <th className="py-3 px-4 text-left border-b">Chi tiết</th>
                                <th className="py-3 px-4 text-left border-b">Xác nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isSearching ? (
                                <tr>
                                    <td colSpan="11" className="text-center py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang tìm kiếm...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((user) => {
                                    if (!user?.Transactions?.Book) return null;

                                    const fine =
                                        user.Transactions.status === 'Quá hạn'
                                            ? calculateFine(user.Transactions.return_date)
                                            : 0;

                                    const overdueDays =
                                        user.Transactions.status === 'Quá hạn'
                                            ? calculateOverdueDays(user.Transactions.return_date)
                                            : 0;

                                    return (
                                        <tr
                                            key={`${user.Transactions.id}-${user.Transactions.Book.id}`}
                                            className="hover:bg-gray-50"
                                        >
                                            {/* <td className="py-2 px-4 border-b">{user.id}</td> */}
                                            <td className="py-2 px-4 border-b">
                                                <div className="w-[140px] truncate" title={user.username}>
                                                    {user.username}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="w-[140px] truncate" title={user.email}>
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <div
                                                    className="w-[160px] truncate"
                                                    title={user.Transactions.Book.title}
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
                                            <td className="py-2 px-4 border-b text-blue-600 font-medium">
                                                {formatCurrentDate()}
                                            </td>
                                            <td className="py-2 px-4 border-b whitespace-nowrap">
                                                {user.Transactions.status === 'Quá hạn' ? (
                                                    <div className="text-red-500 font-medium">{overdueDays} ngày</div>
                                                ) : (
                                                    <div className="text-gray-500">0 ngày</div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {user.Transactions.status === 'Quá hạn' ? (
                                                    <div className="text-red-500 font-medium">
                                                        {formatCurrency(fine)}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500">Không có</div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                <span
                                                    className={`px-2 py-1 rounded text-white inline-block whitespace-nowrap
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
                                            <td className="py-2 px-4 border-b">
                                                <Link
                                                    to={`/bookloanreturndetails/${user.id}`}
                                                    className="whitespace-nowrap text-blue-500 hover:text-blue-700 decoration-sliced underline"
                                                >
                                                    Chi tiết
                                                </Link>
                                            </td>
                                            <td className="py-2 px-4 border-b">
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
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                                    >
                                                        Xác nhận đã trả sách
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="11" className="text-center py-4 text-gray-500">
                                        {searchTerm ? 'Không tìm thấy sinh viên này' : 'Không có dữ liệu'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {!searchTerm && !isSearching && totalPage > 0 && (
                        <footer className="mt-4">
                            <Pagination
                                pageCount={totalPage}
                                currentPage={currentPage}
                                onPageChange={handlePageClick}
                                customStyles={styles}
                            />
                        </footer>
                    )}
                </div>
            </div>
        </>
    );
}

export default BookBorrowingHistory;
