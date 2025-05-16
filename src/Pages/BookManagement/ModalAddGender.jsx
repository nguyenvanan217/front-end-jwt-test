import React, { useState } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import { toast } from 'react-toastify';

function ModalAddGender({ setIsOpenModalAddGende, handleAddGenre }) {
    const [genreName, setGenreName] = useState('');
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!genreName.trim()) {
            setError('Vui lòng nhập tên thể loại');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            handleAddGenre(genreName);
        } else {
            toast.error('Bạn chưa nhập vào tên thể loại');
        }
    };

    const handleOnChangeInput = (e) => {
        setGenreName(e.target.value);
        setError('');
    };

    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-[1000]"
            onClick={() => setIsOpenModalAddGende(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[500px] h-64 relative top-[20%] modal-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-blue-500 pb-3">
                    <h2 className="text-xl font-bold text-green-600">Thêm Thể Loại Mới</h2>
                    <button onClick={() => setIsOpenModalAddGende(false)} className="text-red-500 hover:text-red-700">
                        <FaRegWindowClose size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Thể Loại</label>
                        <input
                            type="text"
                            className={`mt-1 block w-full rounded-md border ${
                                error ? 'border-red-500' : 'border-blue-500'
                            } px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:outline-none`}
                            value={genreName}
                            onChange={handleOnChangeInput}
                        />
                        <div className="h-5">
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setIsOpenModalAddGende(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalAddGender;
