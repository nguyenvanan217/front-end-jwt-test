import React, { useState } from 'react';
import imglogo from '../../assets/img/logo192.png';
import { FaCaretDown } from 'react-icons/fa';
import './Navbar.css';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
    const [dropdown, setDropdown] = useState(false);

    const handleSetting = () => {
        setDropdown(!dropdown);
    };
    const handleLogout = () => {
        setDropdown(!dropdown);
        localStorage.removeItem('access_token');
    }

    return (
        <div className="bg-slate-950 flex items-center justify-between">
            <div className="logo-img pl-4 py-1 flex items-center gap-3">
                <img src={imglogo} alt="" width="45" height="45" className="logo-spin " />
                <div className="text-white text-xl font-bold">Quản Lý Thư Viện</div>
                <div className="manage-books flex gap-5">
                    <NavLink to="/usermanagerment" className="text-white text-base cursor-pointer">Quản Lý Người Dùng</NavLink>
                    <NavLink to="/bookmanagerment" className="text-white text-base cursor-pointer">Quản Lý Sách</NavLink>
                    <NavLink to="/booklist" className="text-white text-base cursor-pointer">Sách Thư Viện</NavLink>
                    <NavLink to="/violationmanagerment" className="text-white text-base cursor-pointer">Quản Lý Phạt Vi Phạm</NavLink>
                    <NavLink to="/bookborrowinghistory" className="text-white text-base cursor-pointer"> Lịch Sử Mượn Sách</NavLink>
                </div>
            </div>
            <div className="setting flex gap-4 pr-6">
                <div className="text-white text-base cursor-pointer">Welcome: Nguyễn An</div>
                <div className="relative">
                    <div
                        className="text-white text-base cursor-pointer flex items-center hover:text-[#61DAFB]"
                        onClick={handleSetting}
                    >
                        Settings <FaCaretDown />
                    </div>
                    <div>
                        {dropdown && (
                            <div className="drop-down flex">
                                <Link to="/"
                                onClick={handleLogout}
                                    className="text-red-500 cursor-pointer bg-transparent border-none"
                                >
                                    Log Out!
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
