import React from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import './BookLoanReturnDetails.css';
function ModalDeleteTransaction(props) {
    return (
        <div className="modal">
            <div
                className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-2"
                onClick={() => props.setIsOpenModal(false)}
            >
                {/* Form content */}
                <div className="w-[450px] h-40 bg-white px-4 py-2 rounded shadow-lg relative top-[30%] modal-slide-down z-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#333] pb-2 z-2">
                        <div className="text-center font-bold text-red-500">Confirm Delete Transaction</div>
                        <div
                            className="cursor-pointer text-red-500 text-xl"
                            onClick={() => props.setIsOpenModal(false)}
                        >
                            <FaRegWindowClose />
                        </div>
                    </div>
                    {/* Body */}
                    <div className="text-gray-800 mt-7 flex-col justify-center items-center border-b border-[#898686] pb-2">
                        <div className="flex items-center gap-2">
                            Bạn có chắc chắn muốn xóa giao dịch có id là:
                            <span className="text-red-500 inline-block max-w-[100%] truncate">
                                {props.getTransactionId}
                            </span>
                            này{' '}
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="flex justify-end">
                        <button
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded mt-3 text-base"
                            onClick={props.handleConfirmDeleteTransaction}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalDeleteTransaction;
