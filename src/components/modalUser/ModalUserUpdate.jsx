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
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-50"
            onClick={() => props.setIsOpenModalUpdate(false)}
        >
            {/* Form content */}
            <div
                className="w-[500px] h-[320px] bg-white px-4 py-2 rounded shadow-lg relative top-[30%] modal-slide-down"
                onClick={handleModalClick}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#333] pb-2">
                    <div className="text-center font-bold text-green-500">Update User</div>
                    <div
                        className="cursor-pointer text-red-500 text-xl"
                        onClick={() => props.setIsOpenModalUpdate(false)}
                    >
                        <FaRegWindowClose />
                    </div>
                </div>
                {/* Body */}
                <div className="text-gray-800 py-5 flex-col justify-center items-center border-b border-[#898686] z-2">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 font-bold">
                            Email <span className="text-red-600">(*)</span>
                        </label>
                        <input
                            ref={(el) => (inputRefs.current[0] = el)}
                            value={transmitUserData.email}
                            type="text"
                            placeholder="Email"
                            className={`w-full h-10 pl-2 ${
                                validInput.email ? 'border border-blue-500' : 'border border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => handleOnchageInput(e, 'email')}
                            onKeyDown={(e) => handleKeyDown(e, 0)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col w-[49%] gap-2 mt-3">
                            <label className="flex items-center gap-2 font-bold">
                                Tên Sinh Viên <span className="text-red-600">(*)</span>
                            </label>
                            <input
                                ref={(el) => (inputRefs.current[1] = el)}
                                value={transmitUserData.username}
                                type="text"
                                placeholder="UserName"
                                className={`w-full h-10 pl-2 ${
                                    validInput.username ? 'border border-blue-500' : 'border border-red-500'
                                } focus:outline-none`}
                                onChange={(e) => handleOnchageInput(e, 'username')}
                                onKeyDown={(e) => handleKeyDown(e, 1)}
                            />
                        </div>
                        <div className="flex flex-col w-[49%] gap-2 mt-3">
                            <label className="flex items-center gap-2 font-bold">
                                Nhóm <span className="text-red-600">(*)</span>
                            </label>
                            <select
                                ref={(el) => (inputRefs.current[2] = el)}
                                value={transmitUserData.group_id}
                                className={`w-full h-10 pl-2 ${
                                    validInput.group_id ? 'border border-blue-500' : 'border border-red-500'
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
                    {/* <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 font-bold">
                            Trạng Thái <span className="text-red-600">(*)</span>
                        </label>
                        <select
                            ref={(el) => (inputRefs.current[3] = el)}
                            value={transmitUserData.status}
                            className={`w-full h-10 pl-2 ${
                                validInput.status ? 'border border-blue-500' : 'border border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => handleOnchageInput(e, 'status')}
                            onKeyDown={(e) => handleKeyDown(e, 3)}
                        >
                            <option value="Chờ trả">Chờ trả</option>
                            <option value="Quá hạn">Quá hạn</option>
                            <option value="Đã trả">Đã trả</option>
                        </select>
                    </div> */}
                </div>
                {/* Footer */}
                <div className="flex justify-end">
                    <button
                        className="bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 text-base"
                        onClick={() => {
                            handleUpdateUser();
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalUserUpdate;
