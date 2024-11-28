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
    ];
    return (
        <>
            {navbarRoutes.includes(location.pathname) && <Navbar />}
            <div className="App">
                <AppRoutes />
            </div>
            <ToastContainer
                position="top-left"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {/* Same as */}
        </>
    );
}

export default App;
