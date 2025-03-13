import React, { useContext, useEffect, useRef, useState } from 'react';
import imglogouniver from '../../assets/img/logo university.png';
import { toast } from 'react-toastify';
// import axios from '../../setup/axios';
import { Link } from 'react-router-dom';
import { loginUser, registerNewUser } from '../../services/userService';
import { useNavigate, NavLink } from 'react-router-dom';
import AuthContext from '../../components/Context/auth.context';
function Login() {
    const { setAuth } = useContext(AuthContext);
    let navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const defaultValueInput = {
        email: true,
        password: true,
    };
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

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
        if (!password) {
            setValueInput({ ...valueInput, password: false });
            toast.error('Password is required!');
            passwordRef.current.focus();
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
    const handleEnterLogin = (event) => {
        if (event.keyCode === 13 && event.code === 'Enter') {
            handleLogin();
        }
    };
    const handleLogin = async () => {
        const check = handleSubmit();
        if (check) {
            let response = await loginUser(email, password);
            if (response && +response.EC === 0) {
                console.log('mới check>>>>>>>>>>>>>>>>', response.DT);
                // console.log('response', response.DT.access_token);
                localStorage.setItem('access_token', response.DT.access_token);
                toast.success(response.EM);
                setAuth({
                    isAuthenticated: true,
                    user: {
                        id: response?.DT?.id ?? '',
                        email: response?.DT?.email ?? '',
                        name: response?.DT?.username ?? '',
                        groupWithRoles: response?.DT?.groupWithRole ?? '',
                    },
                });
                navigate('/usermanagerment');
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
                    <h1 className="text-[#0866FF] flex justify-center mb-3 text-2xl font-bold">Đăng Nhập</h1>
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
                            onKeyDown={(event) => handleNextEnter(event, passwordRef)}
                            ref={emailRef}
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
                            onKeyDown={(event) => handleEnterLogin(event)}
                            ref={passwordRef}
                        />
                    </div>
                    <h1 className="mt-2">
                        Bạn chưa có tài khoản ?
                        <NavLink to="/register" className="text-[#0866FF] border-bottom border-b-[1px] border-blue-500">
                            {' '}
                            Đăng ký ngay
                        </NavLink>
                    </h1>
                    <div className="submit flex justify-center">
                        <button
                            className="bg-blue-600 hover:bg-blue-500 transition-all text-white mt-5 w-full py-2 rounded"
                            onClick={() => handleLogin()}
                        >
                            Đăng Nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
