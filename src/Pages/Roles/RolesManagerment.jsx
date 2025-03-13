import React, { useEffect, useState } from 'react';
import { fetchGroup } from '../../services/userService';
import { fetchRole, fetchGroupWithRole } from '../../services/roleService';
function RolesManagerment() {
    const [group, setGroup] = useState([]);
    const [allRole, setAllRole] = useState([]);
    const [groupWithRole, setGroupWithRole] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    useEffect(() => {
        handleFetchGroup();
        handleFetchRole();
    }, []);
    const handleFetchGroup = async () => {
        try {
            let response = await fetchGroup();
            if (response && response.EC === 0) {
                setGroup(response.DT);
            } else {
                console.log(response.EM);
                setGroup([]);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleFetchRole = async () => {
        try {
            let response = await fetchRole();
            console.log(response);
            if (response && +response.EC === 0) {
                setAllRole(response.DT);
                console.log('>>>>>>>>>>>>check role, ', response.DT);
            } else {
                console.log(response.EM);
                setAllRole([]);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleFetchGroupWithRole = async (id) => {
        try {
            let response = await fetchGroupWithRole(id);

            if (response && +response.EC === 0) {
                setGroupWithRole(response.DT);
                return response.DT;
            } else {
                setGroupWithRole([]);
                return [];
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    const handleOnchangeGroup = async (value) => {
        try {
            console.log('>>>>>>>>>>>>check value, ', value);
            if (value) {
                const data = await handleFetchGroupWithRole(value);
                if (data) {
                    setGroupWithRole(data[0].Roles);
                    setCheckedItems(
                        data[0].Roles.reduce((acc, role) => {
                            acc[role.id] = true;
                            return acc;
                        }, {}),
                    );
                } else {
                    setGroupWithRole([]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleOnchangeCheckbox = (itemId) => {
        setCheckedItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };
    return (
        <div className="container mx-auto px-4 mt-4">
            <h1 className="text-center text-3xl font-bold">Cấp Quyền Người Dùng</h1>
            <div className="flex justify-between mt-7">
                <div className="w-[30%]">
                    <h1 className="text-2xl font-bold">Người Dùng:</h1>
                    <table className="border-collapse border-2 border-gray-300 mt-6">
                        <thead className="bg-[#020617] text-white">
                            <tr>
                                <th className="border border-gray-400 px-4 py-2">Người Dùng</th>
                                <th className="border border-gray-400 px-4 py-2">Mô tả</th>
                            </tr>
                        </thead>

                        <tbody>
                            {group &&
                                group.length > 0 &&
                                group.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border border-gray-400 px-4 py-2">
                                                <strong>{item.name}</strong>
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2">{item.description}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                <div className="w-[65%] mb-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Thông Tin Quyền Hạn:</h1>
                        <div className="flex justify-end">
                            <select
                                name=""
                                id=""
                                className="w-[500px] h-[40px] border border-gray-400 rounded-md pl-4"
                                onChange={(event) => handleOnchangeGroup(event.target.value)}
                            >
                                <option value="Tất Cả Người Dùng">Chọn Đối Tượng Để Xem Quyền Hạn Tại Đây!</option>
                                {group &&
                                    group.length > 0 &&
                                    group.map((item, index) => {
                                        return (
                                            <option value={item.id} key={`group-${index}`}>
                                                Quyền hạn của {item.name}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md">Cấp Quyền</button>
                    </div>
                    <table className="border-collapse border-2 border-gray-300 mt-4">
                        <thead className="bg-[#020617] text-white">
                            <tr>
                                <th className="border border-gray-400 px-4 py-2">Id</th>
                                <th className="border border-gray-400 px-4 py-2">Các Quyền Hạn</th>
                                <th className="border border-gray-400 px-4 py-2">Mô tả</th>
                                <th className="border border-gray-400 px-4 py-2">Cấp Quyền</th>
                            </tr>
                        </thead>

                        <tbody>
                            {allRole && allRole.length > 0 ? (
                                allRole.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border border-gray-400 px-4 py-2">{item.id}</td>
                                            <td className="border border-gray-400 px-4 py-2">{item.url}</td>
                                            <td className="border border-gray-400 px-4 py-2">{item.description}</td>
                                            <td className="border border-gray-400 px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="cursor-pointer w-4 h-4"
                                                    checked={checkedItems[item.id] || false}
                                                    onChange={() => handleOnchangeCheckbox(item.id)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="border border-gray-400 px-4 py-2 text-center text-gray-500"
                                    >
                                        Bạn chưa chọn đối tượng để xem quyền hạn hoặc chưa có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RolesManagerment;
