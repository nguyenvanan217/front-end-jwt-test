import './index.css';
// import Navbar from "./components/Navbar/Navbar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AuthContext from './components/Context/auth.context';
import { useContext, useEffect } from 'react';
import { getAccount } from './services/userService';
import LoadingPage from './components/Loading/LoadingPage';
import { useNavigate } from 'react-router-dom';
import MessengerWithAdmin from './components/MessengerWithAdmin/MessengerWithAdmin';
import React from 'react';
import IconChatBot from './components/IconChatBot/IconChatBot';
import { ChatProvider } from './components/Context/chat.context';
import ToTop from './components/ToTop/ToTop';

function App() {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const fetchAccount = async () => {
        console.log(typeof toast.destroy);
        let response = await getAccount();
        if (response && +response.EC === 0) {
            let data = response.DT;
            console.log('API Response:', data);
            setAuth({
                isLoading: false,
                isAuthenticated: true,
                user: {
                    id: data?.id || '',
                    email: data?.email || '',
                    name: data?.username || '',
                    groupWithRoles: data?.groupWithRoles || null,
                },
            });
        } else {
            console.log('API Error Response:', response);
            toast.warning('Session expired, please login again!');
            setTimeout(() => {
                setAuth({
                    isLoading: false,
                    isAuthenticated: false,
                    user: { id: '', email: '', name: '', groupWithRoles: null },
                });
                navigate('/');
            }, 2000);
            return;
        }
    };

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            fetchAccount();
        } else {
            setAuth({
                isAuthenticated: false,
                isLoading: false,
                user: {
                    id: '',
                    email: '',
                    name: '',
                    groupWithRoles: null,
                },
            });
        }
    }, []);

    return (
        <ChatProvider>
            {auth.isAuthenticated && <Navbar />}
            {auth?.isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <LoadingPage />
                </div>
            ) : (
                <div className="App">
                    <AppRoutes />
                    <ToTop />
                    {auth.isAuthenticated && (
                        <>
                            {/* Hiển thị MessengerWithAdmin chỉ cho sinh viên */}
                            {!auth?.user?.groupWithRoles?.group?.name?.includes('Quản Lý') && <MessengerWithAdmin />}
                            {/* Hiển thị IconChatBot cho cả admin và sinh viên */}
                            <IconChatBot />
                        </>
                    )}
                </div>
            )}
            <ToastContainer />
        </ChatProvider>
    );
}

export default App;
