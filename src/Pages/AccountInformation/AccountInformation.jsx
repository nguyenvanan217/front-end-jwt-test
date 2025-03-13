import React, { useContext, useEffect, useState } from 'react';
import avatar from '../../assets/img/avatar.jpg';
import AuthContext from '../../components/Context/auth.context';
import { getUserDetailsById } from '../../services/userService';
import { toast } from 'react-toastify';

function AccountInformation() {
    const { auth } = useContext(AuthContext);
    const [userDetails, setUserDetails] = useState(null);

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
            toast.error('Có lỗi xảy ra khi lấy thông tin người dùng');
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

    return (
        <div className="p-6 bg-white rounded-lg">
            <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">Thông Tin Tài Khoản Và Lịch Sử Mượn Trả</h2>

            <div className="flex justify-between gap-6">
                {/* Thông tin cá nhân */}
                <div className="w-2/5">
                    <div className="text-center mb-6">
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-blue-500"
                        />
                        <h3 className="text-xl font-semibold">Tên Sinh Viên: {auth.user?.name}</h3>
                        <p className="text-gray-600">{auth.user?.email}</p>
                    </div>

                        <h4 className="font-semibold text-2xl text-green-600 mb-4">Thống kê mượn sách:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span>Đã trả:</span>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                    {calculateStatusCounts().returned} sách
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Chờ trả:</span>
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                                    {calculateStatusCounts().pending} sách
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Quá hạn:</span>
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                    {calculateStatusCounts().overdue} sách
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chi tiết mượn trả */}
                <div className="w-3/5">
                    <h3 className="font-semibold text-2xl text-green-600 mb-4">Lịch sử mượn trả sách:</h3>
                    <div className="space-y-4">
                        {userDetails?.Transactions?.length > 0 ? (
                            userDetails.Transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-600">ID giao dịch:</p>
                                            <p className="font-medium">{transaction.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Tên sách:</p>
                                            <p className="font-medium">{transaction.Book?.title}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Ngày mượn:</p>
                                            <p className="font-medium">{formatDate(transaction.borrow_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Ngày trả:</p>
                                            <p className="font-medium">{formatDate(transaction.return_date)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-600">Trạng thái:</p>
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                    transaction.status === 'Quá hạn'
                                                        ? 'bg-red-100 text-red-800'
                                                        : transaction.status === 'Chờ trả'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">Bạn chưa có lịch sử mượn sách nào</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountInformation;
