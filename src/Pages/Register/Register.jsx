import React, { useEffect, useRef, useState } from 'react';
import imglogouniver from '../../assets/img/logo university.png';
import { toast } from 'react-toastify';
// import axios from '../../setup/axios';
import { Link } from 'react-router-dom';
import { registerNewUser } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
function Register() {
    let navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const defaultValueInput = {
        email: true,
        username: true,
        password: true,
        confirmPassword: true,
    };
    const emailRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const [valueInput, setValueInput] = useState(defaultValueInput);

    // useEffect(() => {
    //     axios.get('http://localhost:6969/api/v1/test-api').then((data) => {
    //         console.log('>>>>>>>>>>>>>>>>>>>Check Data', data);
    //     });
    // }, []);
    const handleSubmit = () => {
        setValueInput(defaultValueInput);
        if (!email) {
            setValueInput({ ...valueInput, email: false });
            emailRef.current.focus();
            toast.error('Email is requiered!');
            return false;
        }
        let regx = /\S+@\S+\.\S+/;
        if (!regx.test(email)) {
            setValueInput({ ...valueInput, email: false });
            toast.error('Please enter a valid email address!');
            emailRef.current.focus();
            return false;
        }
        if (!username) {
            setValueInput({ ...valueInput, username: false });
            toast.error('Please enter UserName!');
            usernameRef.current.focus();
            return false;
        }
        if (!password) {
            setValueInput({ ...valueInput, password: false });
            toast.error('Password is required!');
            passwordRef.current.focus();
            return false;
        }
        if (password !== confirmPassword) {
            setValueInput({ ...valueInput, confirmPassword: false });
            toast.error('Your passwords do not match!');
            confirmPasswordRef.current.focus();
            return false;
        }
        return true;
    };
    const handleNextEnter = (event, nextRef) => {
        if (event.key === 'Enter') {
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };
    const handleEnterRegister = (event) => {
        if (event.keyCode === 13 && event.code === 'Enter') {
            handleRegister();
        }
    };
    const handleRegister = async () => {
        const check = handleSubmit();
        if (check) {
            let response = await registerNewUser(email, username, password);
            if (response && +response.EC === 1 && response.EM.includes('Email is already in use')) {
                toast.error(response.EM);
                setValueInput({ ...valueInput, email: false });
                emailRef.current.focus();
            } else if (response && +response.EC === 0) {
                toast.success(response.EM);
                navigate('/');
            } else {
                toast.error(response.EM);
            }
        }
    };
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="container mx-auto w-[1200px] flex flex-col items-center">
                <div className="title-register flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-bold text-center text-[#0866FF] mb-5">
                        Thư viện Đại học Khoa Học Huế
                    </h1>
                    <img src={imglogouniver} alt="Logo University" height="100px" width="100px" />
                </div>
                <div className="register border border-gray-300 rounded-lg p-6 bg-white shadow-md w-full max-w-sm">
                    <h1 className="text-[#0866FF] flex justify-center mb-3 text-2xl font-bold">Đăng Ký Tài Khoản</h1>
                    <div className="form-email mb-4">
                        <input
                            type="email"
                            value={email}
                            placeholder="Nhập vào địa chỉ Email sinh viên"
                            className={`w-full px-4 py-2 border rounded-md ${
                                valueInput.email ? 'border-blue-500' : 'border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                if (value.trim() !== '') {
                                    setValueInput((prev) => ({ ...prev, email: true }));
                                }
                            }}
                            onKeyDown={(event) => handleNextEnter(event, usernameRef)}
                            ref={emailRef}
                        />
                    </div>
                    <div className="form-name mb-4">
                        <input
                            type="text"
                            value={username}
                            placeholder="Nhập vào User Name"
                            className={`w-full px-4 py-2 border rounded-md ${
                                valueInput.username ? 'border-blue-500' : 'border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => {
                                const value = e.target.value;
                                setUsername(value);
                                if (value.trim() !== '') {
                                    setValueInput((prev) => ({ ...prev, username: true }));
                                }
                            }}
                            onKeyDown={(event) => handleNextEnter(event, passwordRef)}
                            ref={usernameRef}
                        />
                    </div>
                    <div className="form-password mb-4">
                        <input
                            type="password"
                            value={password}
                            placeholder="Nhập vào mật khẩu"
                            className={`w-full px-4 py-2 border rounded-md ${
                                valueInput.password ? 'border-blue-500' : 'border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(event) => handleNextEnter(event, confirmPasswordRef)}
                            ref={passwordRef}
                        />
                    </div>
                    <div className="form-confirm-password">
                        <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Nhập lại mật khẩu"
                            className={`w-full px-4 py-2 border rounded-md ${
                                valueInput.confirmPassword ? 'border-blue-500' : 'border-red-500'
                            } focus:outline-none`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onKeyDown={(event) => handleEnterRegister(event)}
                            ref={confirmPasswordRef}
                        />
                    </div>
                    <h1 className="mt-2">
                        Bạn đã có tài khoản ?
                        <Link to="/" className="text-[#0866FF] border-bottom border-b-[1px] border-blue-500">
                            {' '}
                            Đăng nhập ngay
                        </Link>
                    </h1>
                    <div className="submit flex justify-center">
                        <button
                            className="bg-blue-600 hover:bg-blue-500 transition-all text-white mt-5 w-full py-2 rounded"
                            onClick={() => handleRegister()}
                        >
                            Đăng ký
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
