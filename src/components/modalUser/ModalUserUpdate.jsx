import React, { useEffect, useRef, useState } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import { fetchGroup, fetchStatus, updateCurrentUser } from '../../services/userService';
import { toast } from 'react-toastify';
import './Modal.css';

function ModalUserUpdate(props) {
    const validInputDefault = {
        email: true,
        username: true,
        group: true,
        group_id: true,
        // status: true,
    };

    const transmittedUserData = {
        id: props.dataModal.id,
        email: props.dataModal.email,
        username: props.dataModal.username,
        group: props.dataModal.Group,
        group_id: props.dataModal.Group.id,
        // status: props.dataModal.Transactions[0].status,
    };

    const inputRefs = useRef([]);
    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextIndex = index + 1;
            if (nextIndex < inputRefs.current.length) {
                inputRefs.current[nextIndex].focus();
            } else {
                handleUpdateUser();
            }
        }
    };

    const [userGroup, setUserGroup] = useState([]);
    // const [userStatus, setUserStatus] = useState([]);
    const [transmitUserData, setTransmitUserData] = useState(transmittedUserData);
    const [validInput, setValidInput] = useState(validInputDefault);

    useEffect(() => {
        handleFetchGroup();
        // handleFetchStatus();
    }, []);

    const handleFetchGroup = async () => {
        let response = await fetchGroup();
        if (response && response.EC === 0) {
            setUserGroup(response.DT);
        } else {
            console.log(response.EM);
            setUserGroup([]);
        }
    };

    // const handleFetchStatus = async () => {
    //     let response = await fetchStatus();
    //     if (response && response.EC === 0) {
    //         setUserStatus(response.DT);
    //         console.log('check status', response.DT);
    //     } else {
    //         console.log(response.EM);
    //         setUserStatus([]);
    //     }
    // };

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    const checkValidInput = () => {
        let check = true;
        let updatedValidInput = { ...validInputDefault };
        if (transmitUserData.email === '') {
            updatedValidInput.email = false;
            toast.error('Email is required!');
            check = false;
        }
        if (transmitUserData.username === '') {
            updatedValidInput.username = false;
            toast.error('UserName is required!');
            check = false;
        }
        if (transmitUserData.group === '') {
            updatedValidInput.group = false;
            toast.error('Group is required!');
            check = false;
        }
        setValidInput(updatedValidInput);
        return check;
    };

    const handleOnchageInput = (e, name) => {
        const value = e.target.value;
        setTransmitUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setValidInput((prevValidInput) => ({
            ...prevValidInput,
            [name]: true,
        }));
    };

    const handleUpdateUser = async () => {
        let check = checkValidInput();
        if (check) {
            let response = await updateCurrentUser({
                id: transmitUserData.id,
                email: transmitUserData.email,
                username: transmitUserData.username,
                group_id: +transmitUserData.group_id,
                // status: transmitUserData.status,
            });
            if (response && response.EC === 0) {
                toast.success(response.EM);
                props.handleUpdateSuccess();
                props.setIsOpenModalUpdate(false);
            } else if (response && response.EC === 2) {
                toast.warning(response.EM);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
            onClick={() => props.setIsOpenModalUpdate(false)}
        >
            <div
                className="bg-white rounded-lg shadow-lg w-[500px] relative modal-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-300">
                    <h3 className="text-xl font-semibold text-green-500">Update User</h3>
                    <button
                        onClick={() => props.setIsOpenModalUpdate(false)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <FaRegWindowClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="mb-4">
                        <label className="block font-bold mb-2">
                            Email <span className="text-red-600">(*)</span>
                        </label>
                        <input
                            ref={(el) => (inputRefs.current[0] = el)}
                            value={transmitUserData.email}
                            type="text"
                            placeholder="Email"
                            className={`w-full px-3 py-2 border rounded ${
                                validInput.email ? 'border-blue-500' : 'border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => handleOnchageInput(e, 'email')}
                            onKeyDown={(e) => handleKeyDown(e, 0)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block font-bold mb-2">
                                Tên Sinh Viên <span className="text-red-600">(*)</span>
                            </label>
                            <input
                                ref={(el) => (inputRefs.current[1] = el)}
                                value={transmitUserData.username}
                                type="text"
                                placeholder="UserName"
                                className={`w-full px-3 py-2 border rounded ${
                                    validInput.username ? 'border-blue-500' : 'border-red-500'
                                } focus:outline-none`}
                                onChange={(e) => handleOnchageInput(e, 'username')}
                                onKeyDown={(e) => handleKeyDown(e, 1)}
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-2">
                                Nhóm <span className="text-red-600">(*)</span>
                            </label>
                            <select
                                ref={(el) => (inputRefs.current[2] = el)}
                                value={transmitUserData.group_id}
                                className={`w-full px-3 py-2 border rounded ${
                                    validInput.group_id ? 'border-blue-500' : 'border-red-500'
                                } focus:outline-none`}
                                onChange={(e) => handleOnchageInput(e, 'group_id')}
                                onKeyDown={(e) => handleKeyDown(e, 2)}
                            >
                                {userGroup.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-300">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={() => props.setIsOpenModalUpdate(false)}
                    >
                        Hủy
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleUpdateUser}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalUserUpdate;
