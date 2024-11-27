import React, { useEffect, useState } from 'react';
import { FaRegWindowClose } from 'react-icons/fa';
import { fetchGroup } from '../../services/userService';

function ModalUserUpdate(props) {
    const validInputDefault = {
        email: true,
        username: true,
        group: true,
    };
    const transmittedUserData = {
        email: props.dataModal.email,
        username: props.dataModal.username,
        group: props.dataModal.Group,
        group_id: props.dataModal.Group.id,
    };
    const [userGroup, setUserGroup] = useState([]);
    const [transmitUserData, setTransmitUserData] = useState(transmittedUserData);
    const [validInput, setValidInput] = useState(validInputDefault);
    useEffect(() => {
        handleFetchGroup();
        console.log(props.dataModal.email);
        console.log('check >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', transmittedUserData.group.name);
    }, []);
    const handleFetchGroup = async () => {
        let response = await fetchGroup();
        console.log('Fetch Group', response);
        if (response && response.EC === 0) {
            setUserGroup(response.DT);
        } else {
            console.log(response.EM);
        }
    };
    const handleUpdateUser = () => {
        console.log('Update User');
    };
    const handleModalClick = (e) => {
        e.stopPropagation();
    };
    const checkValidInput = () => {
        setValidInput(validInputDefault);
        let check = true;
        if (transmitUserData.email === '') {
            setValidInput({ ...validInput, email: false });
            check = false;
        }
        if (transmitUserData.username === '') {
            setValidInput({ ...validInput, username: false });
            check = false;
        }
        if (transmitUserData.group === '') {
            setValidInput({ ...validInput, group: false });
            check = false;
        }
        return check;
    };
    const handleOnchageInput = (e, name) => {
        setTransmitUserData({
            ...transmitUserData,
            [name]: e.target.value,
        });
    };
    return (
        <div
            className="fixed inset-0 flex justify-center bg-black bg-opacity-50 z-0"
            onClick={() => props.setIsOpenModalUpdate(false)}
        >
            {/* Form content */}
            <div
                className="w-[450px] h-64 bg-slate-100 px-4 py-2 rounded shadow-lg relative top-[30%]"
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
                            value={transmitUserData.email}
                            type="text"
                            placeholder="Email"
                            className={`w-full h-10 pl-2 ${
                                validInput.email ? 'border order-blue-500' : 'border border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => handleOnchageInput(e, 'email')}
                        />
                    </div>
                    <div className="flex gap-3 mb-3">
                        <input
                            value={transmitUserData.username}
                            type="text"
                            placeholder="UserName"
                            className="w-[49%] h-10 pl-2"
                            onChange={(e) => handleOnchageInput(e, 'username')}
                        />
                        <select
                            className="w-[49%] h-10 pl-2"
                            value={transmitUserData.group_id}
                            onChange={(e) => handleOnchageInput(e, 'group_id')}
                        >
                            {userGroup.map((item) => (
                                <option  key={item.id} value={item.id}>{item.name}</option>
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
