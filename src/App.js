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
                    {auth.isAuthenticated && !auth?.user?.groupWithRoles?.group?.name?.includes('Quản Lý') && (
                        <>
                            <MessengerWithAdmin />
                            <IconChatBot
                                onClick={() => {
                                    // Xử lý khi click vào icon chat bot
                                    console.log('ChatBot clicked');
                                }}
                            />
                        </>
                    )}
                </div>
            )}

            <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                limit={3}
            />
            {/* Same as */}
        </ChatProvider>
    );
}

export default App;
