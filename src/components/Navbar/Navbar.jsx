import React, { useContext, useState, useEffect } from 'react';
import imglogo from '../../assets/img/logo192.png';
import { FaCaretDown } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import './Navbar.css';
import { Link, NavLink } from 'react-router-dom';
import { logoutUser } from '../../services/userService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../Context/auth.context';

function Navbar() {
    const { auth, setAuth } = useContext(AuthContext);
    const [dropdown, setDropdown] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setMobileMenu(false);
        setDropdown(false);
    }, [window.location.pathname]);

    const handleSetting = () => {
        setDropdown(!dropdown);
    };

    const handleMobileMenu = () => {
        setMobileMenu(!mobileMenu);
    };

    const handleLogout = async () => {
        setDropdown(false);
        setMobileMenu(false);
        localStorage.removeItem('access_token');
        setAuth({
            isAuthenticated: false,
            isLoading: false,
            user: {
                email: '',
                name: '',
                groupWidthRoles: null,
            },
        });

        let response = await logoutUser();
        if (response && +response.EC === 0) {
            toast.success(response.EM);
            navigate('/');
        } else {
            toast.error(response.EM);
        }
    };

    const handleNavLinkClick = () => {
        setMobileMenu(false);
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
                        <NavLink to="/usermanagerment" className="nav-link" onClick={handleNavLinkClick}>
                            Quản Lý Người Dùng
                        </NavLink>
                        <NavLink to="/bookmanagerment" className="nav-link" onClick={handleNavLinkClick}>
                            Quản Lý Sách
                        </NavLink>
                        <NavLink to="/booklist" className="nav-link" onClick={handleNavLinkClick}>
                            Sách Thư Viện
                        </NavLink>
                        <NavLink to="/bookborrowinghistory" className="nav-link" onClick={handleNavLinkClick}>
                            Quản Lý Mượn Sách
                        </NavLink>
                        <NavLink to="/rolemanagerment" className="nav-link" onClick={handleNavLinkClick}>
                            Quản Lý Quyền
                        </NavLink>
                    </div>

                    {/* User Section */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-white">Welcome: {auth.user.name}</div>
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
                                        Đăng xuất!
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
                    <NavLink to="/usermanagerment" className="mobile-nav-link" onClick={handleNavLinkClick}>
                        Quản Lý Người Dùng
                    </NavLink>
                    <NavLink to="/bookmanagerment" className="mobile-nav-link" onClick={handleNavLinkClick}>
                        Quản Lý Sách
                    </NavLink>
                    <NavLink to="/booklist" className="mobile-nav-link" onClick={handleNavLinkClick}>
                        Sách Thư Viện
                    </NavLink>
                    <NavLink to="/bookborrowinghistory" className="mobile-nav-link" onClick={handleNavLinkClick}>
                        Quản Lý Mượn Sách
                    </NavLink>
                    <NavLink to="/rolemanagerment" className="mobile-nav-link" onClick={handleNavLinkClick}>
                        Quản Lý Quyền
                    </NavLink>
                    <div className="pt-4 border-t border-slate-700 mb-2">
                        <div className="text-white mb-2">Welcome: {auth.user.name}</div>
                        <Link to="/" onClick={handleLogout} className="text-red-500 block">
                            Đăng xuất
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
