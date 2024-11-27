import React from 'react';
import { FaRegWindowClose } from 'react-icons/fa';

function ModalUser(props) {
    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-1"
            onClick={() => props.setIsOpenModal(false)}
        >
            {/* Form content */}
            <div className="w-[450px] h-48 bg-slate-100 px-4 py-2 rounded shadow-lg relative top-[30%]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                    <div className="text-center font-bold text-red-500">Confirm Delete User</div>
                    <div className="cursor-pointer text-red-500 text-xl" onClick={() => props.setIsOpenModal(false)}>
                        <FaRegWindowClose />
                    </div>
                </div>
                {/* Body */}
                <div className="text-gray-800 mt-7 flex-col justify-center items-center border-b border-[#898686] pb-2">
                    <div>Bạn có chắc chắn muốn xóa sinh viên: </div>
                    <span className="text-red-500 inline-block max-w-[100%] truncate">{props.dataModal.username}</span>
                </div>
                {/* Footer */}
                <div className="flex justify-end">
                    <button
                        className='"bg-red-500 bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 text-base'
                        onClick={() => props.confirmDeleleUser()}
                    >
                        Confirm{' '}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalUser;
