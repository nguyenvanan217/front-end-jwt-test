import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers, deleteUser } from '../../services/userService';
import ModalUser from '../modalUser/ModalUser';
import ModalUserUpdate from '../modalUser/ModalUserUpdate';
import { Link } from 'react-router-dom';
function UserManagement() {
    const [listUser, setListUser] = useState([]);
    const [dataModal, setDataModal] = useState({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenModalUpdate, setIsOpenModalUpdate] = useState(false);
    useEffect(() => {
        fetchAllUser();
    }, []);
    const fetchAllUser = async () => {
        try {
            const response = await getAllUsers();
            if (response && response.EC === 0) {
                setListUser(response.DT);
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
            <div className="w-[97%] mx-auto mt-4">
                <div className="text-3xl font-bold mb-6 text-center">Quản lý tài khoản sinh viên:</div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        {/* Table Head */}
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
                        {/* Table Body */}
                        <tbody>
                            {listUser && listUser.length > 0 ? (
                                listUser.map((item, index) => {
                                    return (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="px-4 py-2 text-center border border-gray-300">{item.id}</td>
                                            <td className="px-4 py-2 text-center border border-gray-300 max-w-[180px] truncate">
                                                {item.email}
                                            </td>
                                            <td className="px-4 py-2 text-center border border-gray-300 max-w-[180px] truncate">
                                                {item.username}
                                            </td>
                                            <td className="px-4 py-2 text-center border border-gray-300">
                                                {item.Group.name}
                                            </td>
                                            <td className="w-46 py-2 text-center border border-gray-300">
                                                <span
                                                    className={item && +item.borrowedBooksCount > 0 ? 'font-bold' : ''}
                                                >
                                                    {item && +item.borrowedBooksCount > 0
                                                        ? item.borrowedBooksCount + ' cuốn'
                                                        : 'Chưa mượn lần nào'}
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
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default UserManagement;
