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
function App() {
    const { setAuth } = useContext(AuthContext);

    const fetchAccount = async () => {
        let response = await getAccount();
        if (response && +response.EC === 0) {
            setAuth({
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
        // if (localStorage.getItem('access_token')) {
        fetchAccount();
        // }
    }, []);

    const location = useLocation();
    const navbarRoutes = [
        '/usermanagerment',
        '/bookmanagerment',
        '/booklist',
        '/violationmanagerment',
        '/bookborrowinghistory',
        '/bookloanreturndetails/:id',
    ];
    const isBookLoanReturnDetailPage = location.pathname.startsWith('/bookloanreturndetails');
    return (
        <>
            {(navbarRoutes.includes(location.pathname) || isBookLoanReturnDetailPage) && <Navbar />}
            <div className="App">
                <AppRoutes />
            </div>
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
