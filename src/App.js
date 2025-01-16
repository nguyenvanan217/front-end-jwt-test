import './index.css';
// import Navbar from "./components/Navbar/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
function App() {
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
                position="top-right"
                autoClose={5000}
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
