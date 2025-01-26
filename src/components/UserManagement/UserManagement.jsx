import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers, deleteUser } from '../../services/userService';
import ModalUser from '../modalUser/ModalUser';
import ModalUserUpdate from '../modalUser/ModalUserUpdate';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Pagination from '../Paginate/ReactPaginate';
import styles from './UserManagement.module.css';

function UserManagement() {
    const [listUser, setListUser] = useState([]);
    const [dataModal, setDataModal] = useState({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenModalUpdate, setIsOpenModalUpdate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [sortOrder, setSortOrder] = useState('none');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(8);
    const [totalPage, setTotalPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => clearTimeout(timer);
        }, [value, delay]);

        return debouncedValue;
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 1000);

    useEffect(() => {
        fetchAllUser();
    }, [currentPage]);

    useEffect(() => {
        if (searchTerm) {
            setIsLoading(true);
            setHasSearched(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm !== undefined) {
            fetchAllUser().finally(() => {
                setIsLoading(false);
                setHasSearched(true);
            });
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        filterUsers();
    }, [listUser, searchTerm, sortOrder]);

    const filterUsers = () => {
        let filtered = [...listUser];

        if (searchTerm.trim()) {
            const searchTermLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((user) => user.username.toLowerCase().includes(searchTermLower));
        }

        switch (sortOrder) {
            case 'desc':
                filtered.sort((a, b) => (+b.borrowedBooksCount || 0) - (+a.borrowedBooksCount || 0));
                break;
            case 'asc':
                filtered.sort((a, b) => (+a.borrowedBooksCount || 0) - (+b.borrowedBooksCount || 0));
                break;
            default:
                break;
        }

        setFilteredUsers(filtered);
    };

    const fetchAllUser = async () => {
        try {
            const response = await getAllUsers(currentPage, currentLimit, searchTerm);
            if (response && response.EC === 0) {
                setTotalPage(response.DT.totalPages);
                setListUser(response.DT.users);
            } else {
                toast.error(response.EM);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleDeleteUser = (item) => {
        setIsOpenModal(true);
        setDataModal(item);
    };
    const handleUpdateUser = (item) => {
        setIsOpenModalUpdate(true);
        setDataModal(item);
    };
    const confirmDeleleUser = async () => {
        let response = await deleteUser(dataModal);
        if (response && response.EC === 0) {
            toast.success(response.EM);
            fetchAllUser();
        } else {
            toast.error(response.EM);
        }
        setIsOpenModal(false);
    };
    const handleUpdateSuccess = () => {
        fetchAllUser();
    };
    const handlePageClick = async (event) => {
        setCurrentPage(+event.selected + 1);
        await fetchAllUser();
    };

    return (
        <>
            {isOpenModal && (
                <ModalUser
                    dataModal={dataModal}
                    setIsOpenModal={setIsOpenModal}
                    confirmDeleleUser={confirmDeleleUser}
                />
            )}
            {isOpenModalUpdate && (
                <ModalUserUpdate
                    dataModal={dataModal}
                    setIsOpenModalUpdate={setIsOpenModalUpdate}
                    handleUpdateSuccess={handleUpdateSuccess}
                />
            )}
            <div className={styles.container}>
                <div className="w-[97%] mx-auto mt-4">
                    <div className="text-3xl font-bold mb-6 text-center">Quản lý tài khoản sinh viên:</div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-[96%]">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên sinh viên..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                }}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="w-full md:w-[28%]">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            >
                                <option value="none">Tất cả sinh viên</option>
                                <option value="desc">Nhiều mượn nhất → Ít nhất</option>
                                <option value="asc">Ít mượn nhất → Nhiều nhất</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-[#020617] text-white">
                                    <th className="px-4 py-2 border border-gray-300">Id</th>
                                    <th className="px-4 py-2 border border-gray-300">Email</th>
                                    <th className="px-4 py-2 border border-gray-300">Tên Sinh Viên</th>
                                    <th className="px-4 py-2 border border-gray-300">Nhóm</th>
                                    <th className="px-4 py-2 border border-gray-300">Đã Mượn</th>
                                    <th className="px-4 py-2 border border-gray-300">Trạng Thái</th>
                                    <th className="px-4 py-2 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers && filteredUsers.length > 0 ? (
                                    filteredUsers.map((item, index) => {
                                        const groupName = item?.Group?.name || 'Chưa có nhóm';
                                        const borrowCount = item?.borrowedBooksCount || 0;

                                        return (
                                            <tr key={index} className="hover:bg-gray-100">
                                                <td className="px-4 py-2 text-center border border-gray-300">
                                                    {item.id}
                                                </td>
                                                <td className="px-4 py-2 text-center border border-gray-300 max-w-[180px] truncate">
                                                    {item.email}
                                                </td>
                                                <td className="px-4 py-2 text-center border border-gray-300 max-w-[180px] truncate">
                                                    {item.username}
                                                </td>
                                                <td className="px-4 py-2 text-center border border-gray-300">
                                                    {groupName}
                                                </td>
                                                <td className="w-46 py-2 text-center border border-gray-300">
                                                    <span className={borrowCount > 0 ? 'font-bold' : ''}>
                                                        {borrowCount > 0 ? `${borrowCount} cuốn` : 'Chưa mượn lần nào'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center border border-gray-300 text-white">
                                                    <Link
                                                        className="text-blue-500 decoration-slice underline"
                                                        to={`/bookloanreturndetails/${item.id}`}
                                                    >
                                                        Xem Chi tiết
                                                    </Link>
                                                </td>
                                                <td className=" py-2 text-center border border-gray-300 flex justify-center gap-5">
                                                    <button
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                        onClick={() => handleUpdateUser(item)}
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                        onClick={() => handleDeleteUser(item)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            {(searchTerm && !hasSearched) || isLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Đang tìm kiếm...</span>
                                                </div>
                                            ) : searchTerm && hasSearched ? (
                                                'Không tìm thấy kết quả'
                                            ) : (
                                                'Không có dữ liệu'
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {totalPage > 0 && (
                            <footer>
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
            </div>
        </>
    );
}

export default UserManagement;
