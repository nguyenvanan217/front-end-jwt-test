import './index.css';
// import Navbar from "./components/Navbar/Navbar";
import Register from './components/Register/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <div className="App">
                {/* <Navbar/> */}
                <Register />
            </div>
            <ToastContainer
               position="bottom-left"
               autoClose={false}
               newestOnTop={false}
               closeOnClick
               rtl={false}
               pauseOnFocusLoss
               draggable
               theme="light"
            />
            {/* Same as */}
            <ToastContainer />
        </>
    );
}

export default App;
