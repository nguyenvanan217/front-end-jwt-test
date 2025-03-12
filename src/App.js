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
function App() {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const fetchAccount = async () => {
        let response = await getAccount();
        if (response && +response.EC === 0) {
            setAuth({
                isLoading: false,
                isAuthenticated: true,
                user: {
                    email: response.DT.email,
                    name: response.DT.username,
                    groupWidthRoles: response.DT.groupWithRoles,
                },
            });
        } else if (response.data === null) {
            console.log('check >>>>>>>>>>>>>>>>response.data', response.data);
            toast.warning('Session expirer please login again!');
            setTimeout(() => {
                setAuth({
                    isLoading: false,
                    isAuthenticated: false,
                    user: { id: '', name: '', groupWidthRoles: '' },
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
                    email: '',
                    name: '',
                    groupWidthRoles: null,
                },
            });
        }
    }, []);
    return (
        <>
            {auth.isAuthenticated && <Navbar />}
            {auth?.isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <LoadingPage />
                </div>
            ) : (
                <div className="App">
                    <AppRoutes />
                </div>
            )}

            <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={false}
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
        </>
    );
}

export default App;
