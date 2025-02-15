import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../components/Context/auth.context';

const PrivateRoutes = () => {
    const { auth } = useContext(AuthContext);
    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
