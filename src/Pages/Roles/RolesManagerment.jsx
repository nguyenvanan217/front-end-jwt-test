import React, { useEffect, useState } from 'react';
import { fetchGroup } from '../../services/userService';
import { fetchRole, fetchGroupWithRole } from '../../services/roleService';
function RolesManagerment() {
    const [group, setGroup] = useState([]);
    const [role, setRole] = useState([]);
    const [groupWithRole, setGroupWithRole] = useState([]);
    useEffect(() => {
        handleFetchGroup();
        handleFetchRole();
        handleFetchGroupWithRole(1);
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
                setRole(response.DT);
                console.log('>>>>>>>>>>>>check role, ', response.DT);
            } else {
                console.log(response.EM);
                setRole([]);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleFetchGroupWithRole = async (id) => {
        try {
            let response = await fetchGroupWithRole(id);
            if (response && response.EC === 0) {
                setGroupWithRole(response.DT);
            } else {
                console.log(response.EM);
                setGroupWithRole([]);
            }
        } catch (error) {
            console.log(error);
        }
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
                <div className="w-[65%]">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Thông Tin Quyền Hạn:</h1>
                        <div className="flex justify-end">
                            <select name="" id="" className="w-[500px] h-[40px] border border-gray-400 rounded-md">
                                <option value="Tất Cả Người Dùng">Tất Cả Người Dùng</option>
                                {group &&
                                    group.length > 0 &&
                                    group.map((item, index) => {
                                        return (
                                            <option value={item.id} key={index}>
                                                {item.name}
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
                            {role &&
                                role.length > 0 &&
                                role.map((item, index) => {
                                    console.log(item);
                                    return (
                                        <tr key={index}>
                                            <td className="border border-gray-400 px-4 py-2">{item.id}</td>
                                            <td className="border border-gray-400 px-4 py-2">{item.url}</td>
                                            <td className="border border-gray-400 px-4 py-2">{item.description}</td>
                                            <td className="border border-gray-400 px-4 py-2 text-center">
                                                <input type="checkbox" className="cursor-pointer" />
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RolesManagerment;
