import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../components/Context/auth.context';

const PublicRoutes = ({ children }) => {
    const { auth } = useContext(AuthContext);
    const isAdmin = auth?.user?.groupWithRoles?.group?.name?.includes('Quản Lý');

    // Nếu đã đăng nhập, điều hướng về trang chính tương ứng
    if (auth.isAuthenticated) {
        return <Navigate to={isAdmin ? '/usermanagerment' : '/booklist'} />;
    }

    return children;
};

export default PublicRoutes;
