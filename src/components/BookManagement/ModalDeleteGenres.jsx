import React, { useState, useEffect } from 'react';
import { deleteGenre, getAllGenres } from '../../services/bookManagerService';
import { toast } from 'react-toastify';
import { FaRegWindowClose } from 'react-icons/fa';

function ModalDeletegenres({ setIsOpenModalDeleteGenre }) {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        fetchAllGenres();
    }, []);

    const fetchAllGenres = async () => {
        const response = await getAllGenres();
        if (response && response.EC === 0) {
            setGenres(response.DT);
        } else {
            toast.error(response.EM);
        }
    };
    const handleBtnDeleteGenre = async (genreId) => {
        let response = await deleteGenre(genreId);
        if (response && response.EC === 0) {
            toast.success(response.EM);
            fetchAllGenres();
        } else {
            toast.error(response.EM);
        }
    }

    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsOpenModalDeleteGenre(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-3 w-[500px] min-h-[300px] max-h-[50vh] relative top-[20%] modal-slide-down flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-500 pb-3">
                    <h2 className="text-xl font-bold text-green-600">Danh Sách Thể Loại</h2>
                    <button
                        onClick={() => setIsOpenModalDeleteGenre(false)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Table Content - với overflow-y-auto */}
                <div className="flex-grow overflow-y-auto my-4">
                    <table className="w-full">
                        <thead className=" bg-black">
                            <tr className="bg-black text-white">
                                <th className="text-center">ID</th>
                                <th className="text-center">Tên thể loại</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {genres && genres.length > 0 ? (
                                genres.map((genre, index) => (
                                    <tr key={genre.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{genre.name}</td>
                                        <td className="text-center">
                                            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                              onClick={() => handleBtnDeleteGenre(genre.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-4">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer - luôn ở dưới cùng */}
                <div className="border-t border-gray-200 pt-3 mt-auto">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsOpenModalDeleteGenre(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalDeletegenres;
