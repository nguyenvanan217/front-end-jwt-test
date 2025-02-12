import React, { useState } from 'react';
import imglogo from '../../assets/img/logo192.png';
import { FaCaretDown } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import './Navbar.css';
import { Link, NavLink } from 'react-router-dom';
import { logoutUser } from '../../services/userService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
function Navbar() {
    const [dropdown, setDropdown] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const navigate = useNavigate();
    const handleSetting = () => {
        setDropdown(!dropdown);
    };

    const handleMobileMenu = () => {
        setMobileMenu(!mobileMenu);
    };

    const handleLogout = async () => {
        setDropdown(!dropdown);
        localStorage.removeItem('access_token');
        let response = await logoutUser();
        if (response && +response.EC === 0) {
            toast.success(response.EM);
            navigate('/');
        } else {
            toast.error(response.EM);
        }
    };

    return (
        <nav className="bg-slate-950 border-b border-slate-700">
            {/* Desktop Navigation */}
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <img src={imglogo} alt="Logo" width="45" height="45" className="logo-spin" />
                        <div className="text-white text-base md:text-xl font-bold whitespace-nowrap">
                            Quản Lý Thư Viện
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-5">
                        <NavLink to="/usermanagerment" className="nav-link">
                            Quản Lý Người Dùng
                        </NavLink>
                        <NavLink to="/bookmanagerment" className="nav-link">
                            Quản Lý Sách
                        </NavLink>
                        <NavLink to="/booklist" className="nav-link">
                            Sách Thư Viện
                        </NavLink>
                        <NavLink to="/bookborrowinghistory" className="nav-link">
                            Quản Lý Mượn Sách
                        </NavLink>
                    </div>

                    {/* User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-white">Welcome: Nguyễn An</div>
                        <div className="relative">
                            <button
                                className="text-white flex items-center gap-1 hover:text-[#61DAFB]"
                                onClick={handleSetting}
                            >
                                Settings <FaCaretDown />
                            </button>
                            {dropdown && (
                                <div className="drop-down">
                                    <Link to="/" onClick={handleLogout} className="text-red-500">
                                        Log Out!
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button className="text-white text-2xl" onClick={handleMobileMenu}>
                            <HiMenu />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden bg-slate-900 mobile-menu ${mobileMenu ? 'open' : ''}`}>
                <div className="px-4 space-y-3 py-2">
                    <NavLink to="/usermanagerment" className="mobile-nav-link">
                        Quản Lý Người Dùng
                    </NavLink>
                    <NavLink to="/bookmanagerment" className="mobile-nav-link">
                        Quản Lý Sách
                    </NavLink>
                    <NavLink to="/booklist" className="mobile-nav-link">
                        Sách Thư Viện
                    </NavLink>
                    <NavLink to="/violationmanagerment" className="mobile-nav-link">
                        Quản Lý Phạt Vi Phạm
                    </NavLink>
                    <NavLink to="/bookborrowinghistory" className="mobile-nav-link">
                        Quản Lý Mượn Sách
                    </NavLink>

                    <div className="pt-4 border-t border-slate-700 mb-2">
                        <div className="text-white mb-2">Welcome: Nguyễn An</div>
                        <Link to="/" onClick={handleLogout} className="text-red-500 block">
                            Log Out!
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
