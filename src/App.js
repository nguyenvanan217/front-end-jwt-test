import './index.css';
// import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AuthContext from './components/Context/auth.context';
import { useContext, useEffect } from 'react';
import { getAccount } from './services/userService';
import LoadingPage from './components/Loading/LoadingPage';

function App() {
    const { auth, setAuth } = useContext(AuthContext);

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
            />
            {/* Same as */}
        </>
    );
}

export default App;
