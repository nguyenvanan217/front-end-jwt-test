import { useState, useEffect, useContext } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import AuthContext from '../Context/auth.context';

const ToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { auth } = useContext(AuthContext);
    const isAdmin = auth?.user?.groupWithRoles?.group?.name?.includes('Quản Lý');

    const toggleVisibility = () => {
        if (window.pageYOffset > 200) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            <button
                onClick={scrollToTop}
                className={`
                    fixed 
                    ${isAdmin ? 'bottom-[110px] sm:bottom-[120px]' : 'bottom-[150px] sm:bottom-[170px]'}
                    right-4 sm:right-[19px]
                    p-2 sm:p-[13px]
                    bg-blue-500 
                    hover:bg-blue-600 
                    text-white 
                    rounded-full 
                    shadow-lg
                    transition-all 
                    duration-500
                    ease-in-out
                    transform 
                    hover:scale-110
                    z-50
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20 pointer-events-none'}
                `}
                aria-label="Scroll to top"
            >
                <FaArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </>
    );
};

export default ToTop;
