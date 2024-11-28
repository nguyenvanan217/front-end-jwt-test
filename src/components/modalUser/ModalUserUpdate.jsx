import React, { useEffect, useRef, useState } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import { fetchGroup, updateCurrentUser } from '../../services/userService';
import { toast } from 'react-toastify';
import './Modal.css';
function ModalUserUpdate(props) {
    const validInputDefault = {
        email: true,
        username: true,
        group: true,
        group_id: true,
    };
    const transmittedUserData = {
        id: props.dataModal.id,
        email: props.dataModal.email,
        username: props.dataModal.username,
        group: props.dataModal.Group,
        group_id: props.dataModal.Group.id,
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
    // useEffect(() => {
    //     setTransmitUserData({
    //         id: props.dataModal.id,
    //         email: props.dataModal.email,
    //         username: props.dataModal.username,
    //         group: props.dataModal.Group,
    //         group_id: props.dataModal.Group?.id,
    //     });
    // }, [props.dataModal]);
    const [userGroup, setUserGroup] = useState([]);
    const [transmitUserData, setTransmitUserData] = useState(transmittedUserData);
    const [validInput, setValidInput] = useState(validInputDefault);
    useEffect(() => {
        handleFetchGroup();
    }, []);
    const handleFetchGroup = async () => {
        let response = await fetchGroup();
        if (response && response.EC === 0) {
            setUserGroup(response.DT);
        } else {
            console.log(response.EM);
        }
    };
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
        setTransmitUserData({
            ...transmitUserData,
            [name]: e.target.value,
        });
        console.log(transmitUserData.group_id);
        setValidInput({
            ...validInput,
            [name]: true,
        });
    };
    const handleUpdateUser = async () => {
        let check = checkValidInput();
        if (check) {
            let response = await updateCurrentUser({
                id: transmitUserData.id,
                email: transmitUserData.email,
                username: transmitUserData.username,
                group_id: +transmitUserData.group_id,
            });
            if (response && response.EC === 0) {
                toast.success(response.EM);
                props.handleUpdateSuccess();
                props.setIsOpenModalUpdate(false);
            } else {
                toast.warning(response.EM);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-0"
            onClick={() => props.setIsOpenModalUpdate(false)}
        >
            {/* Form content */}
            <div
                className="w-[500px] h-[270px] bg-white px-4 py-2 rounded shadow-lg relative top-[30%] modal-slide-down"
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
                <div className="text-gray-800 mt-7 flex-col justify-center items-center border-b border-[#898686] pb-2 z-2">
                    <div className="my-4">
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
                    <div className="flex gap-3 pb-7">
                        <input
                            ref={(el) => (inputRefs.current[1] = el)}
                            value={transmitUserData.username}
                            type="text"
                            placeholder="UserName"
                            className={`w-[49%] h-10 pl-2 ${
                                validInput.username ? 'border border-blue-500' : 'border border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => handleOnchageInput(e, 'username')}
                            onKeyDown={(e) => handleKeyDown(e, 1)}
                        />
                        <select
                            ref={(el) => (inputRefs.current[2] = el)}
                            value={transmitUserData.group_id}
                            className={`w-[49%] h-10 pl-2 ${
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
                {/* Footer */}
                <div className="flex justify-end">
                    <button
                        className='"bg-red-500 bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3 text-base'
                        onClick={() => handleUpdateUser()}
                    >
                        Confirm{' '}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalUserUpdate;
